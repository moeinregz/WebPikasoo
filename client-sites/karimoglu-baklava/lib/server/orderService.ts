import { randomUUID } from "crypto";
import { sanitizeCoordinates } from "@/lib/server/geo";
import { db } from "@/lib/server/db";
import { findOrderIdByIdempotencyKey } from "@/lib/server/orderRepo";
import { validateCart } from "@/lib/cart/validateCart";
import { calculateCartPricing } from "@/lib/pricing";
import { selectBranchForOrder } from "@/lib/branch-selection/branchSelectionService";
import { branches } from "@/lib/mock-data";
import { reserveForOrder } from "@/lib/inventory/core";
import { SYSTEM_ACTOR } from "@/lib/inventory/rbac";
import type {
  CartItem,
  CustomerInfo,
  DeliveryAddress,
  DeliveryMethod,
  Order,
  OrderItem,
  PaymentMethod,
} from "@/lib/types";

export class OrderCreationError extends Error {
  constructor(
    message: string,
    public readonly code: "cart_invalid" | "branch_unresolved" | "stock_conflict" | "payment_method_unavailable",
    public readonly details: unknown,
  ) {
    super(message);
  }
}

function generateOrderNumber(): string {
  const now = new Date();
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate(),
  ).padStart(2, "0")}`;
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `KO-${datePart}-${randomPart}`;
}

const CANCEL_WINDOW_MS = 5 * 60 * 1000;

/**
 * اجرای مراحل ۱ تا ۸ چک‌لیست Prompt 7 (بخش ۸): اعتبارسنجی سبد → محاسبه مجدد
 * قیمت → بررسی موجودی → تعیین شعبه (ماژول کامل Prompt 8) → محاسبه هزینه
 * ارسال → رزرو اتمیک موجودی → ایجاد سفارش.
 *
 * Idempotency: اگر `idempotencyKey` قبلاً برای یک سفارش استفاده شده باشد،
 * سفارش قبلی برگردانده می‌شود و نه سفارش جدید ساخته می‌شود و نه موجودی دوباره
 * رزرو می‌شود (بخش ۸ Prompt 7، آخرین خط؛ و بخش «همزمانی» Prompt 8).
 */
export async function createOrder(input: {
  items: CartItem[];
  customer: CustomerInfo;
  address: DeliveryAddress;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  idempotencyKey: string;
  preferredBranchId?: string;
}): Promise<Order> {
  const existingOrderId = await findOrderIdByIdempotencyKey(input.idempotencyKey);
  if (existingOrderId) {
    const existingOrder = await db.orders.get(existingOrderId);
    if (existingOrder) return existingOrder;
  }

  if (input.items.length === 0) {
    throw new OrderCreationError("سبد خرید خالی است.", "cart_invalid", { issues: [] });
  }

  // مختصات مشتری (اگر داده شده) برای انتخاب نزدیک‌ترین شعبه؛ ورودی کلاینت است، پس اعتبارسنجی می‌شود
  const customerCoordinates = sanitizeCoordinates(
    input.address.latitude != null && input.address.longitude != null
      ? { lat: input.address.latitude, lng: input.address.longitude }
      : null,
  );

  // مرحله ۱-۳: اعتبارسنجی ساختاری اقلام سبد (محصول/Variant/بسته‌بندی/قیمت)
  const validation = await validateCart(input.items, {
    city: input.address.city,
    coordinates: customerCoordinates,
    deliveryMethod: input.deliveryMethod,
    preferredBranchId: input.preferredBranchId,
  });
  if (!validation.isValid) {
    throw new OrderCreationError("سبد خرید نیاز به اصلاح دارد.", "cart_invalid", validation.issues);
  }

  // مرحله ۴: تعیین شعبه با ماژول کامل Prompt 8 (شامل فاصله/امکان ارسال/رتبه‌بندی)
  const selection = await selectBranchForOrder({
    cartItems: input.items,
    customerLocation: { coordinates: customerCoordinates, city: input.address.city },
    deliveryMethod: input.deliveryMethod,
    preferredBranchId: input.preferredBranchId,
  });

  if (selection.status !== "selected" || !selection.selected) {
    throw new OrderCreationError(
      selection.userMessage ?? "در حال حاضر شعبه‌ای برای تأمین این سفارش در دسترس نیست.",
      "branch_unresolved",
      selection,
    );
  }

  const { branchId, branchName, deliveryFee, etaMinutesMin, etaMinutesMax } = selection.selected;

  // ===== اعتبارسنجی روش پرداخت بر اساس قابلیت واقعی شعبه (اطلاعات جدید:
  // شعبه تجریش «پرداخت درب منزل» دارد؛ سایر شعب فعلاً ندارند) =====
  //
  // ⚠️ یافته امنیتی جانبی هنگام افزودن این بخش: روش پرداخت «کارت‌خوان در
  // شعبه» (in-branch-pos) از قبل در پروژه وجود داشت و به‌درستی در UI بر
  // اساس `branch.hasPos` فیلتر می‌شد (app/checkout/page.tsx)، اما هرگز
  // سمت سرور دوباره بررسی نمی‌شد — یعنی یک کاربر می‌توانست با دستکاری
  // درخواست، `paymentMethod: "in-branch-pos"` را برای شعبه‌ای بدون POS
  // ارسال کند و سرور آن را بدون چون‌وچرا می‌پذیرفت. این دقیقاً همان کلاس
  // «Branch/Payment Tampering» است که پروژه از ابتدا صریحاً منع کرده. این
  // بررسی، هم آن حفره قدیمی و هم قابلیت جدید را یک‌جا و اصولی می‌بندد.
  const resolvedBranch = branches.find((b) => b.id === branchId);
  const isPaymentMethodSupported =
    input.paymentMethod === "online" ||
    input.paymentMethod === "card-to-card" ||
    (input.paymentMethod === "in-branch-pos" && resolvedBranch?.hasPos) ||
    (input.paymentMethod === "cash-on-delivery" && resolvedBranch?.supportsCashOnDelivery);
  if (!isPaymentMethodSupported) {
    throw new OrderCreationError(
      "روش پرداخت انتخاب‌شده برای این شعبه در دسترس نیست.",
      "payment_method_unavailable",
      { branchId, paymentMethod: input.paymentMethod },
    );
  }

  // شناسه سفارش زودتر از حد معمول تولید می‌شود (پیش از رزرو) چون سیستم
  // موجودی جدید (Prompt 9) رزرو را به `orderId` گره می‌زند — هم برای Audit
  // Trail («این تراکنش موجودی مربوط به کدام سفارش است؟») و هم برای Idempotency
  // واقعی سطح موجودی (تلاش مجدد با همان idempotencyKey => همان orderId => رزرو
  // تکراری انجام نمی‌شود، طبق رفتار `reserveForOrder`).
  const now = new Date();
  const orderId = randomUUID();

  // مرحله ۵: رزرو اتمیک موجودی کل سبد (شعبه + محصول + Variant) — «All-or-nothing»،
  // طبق بخش «همزمانی» Prompt 8 و Prompt 9. این دقیقاً همان نقطه‌ای است که اگر
  // بین لحظه انتخاب شعبه (بالا) و همین‌جا یک سفارش هم‌زمان دیگر آخرین واحد
  // موجودی را برداشته باشد، رزرو با شکست مواجه می‌شود و سفارش ایجاد نمی‌شود —
  // به‌جای این‌که هر دو سفارش موفق شوند.
  const reservation = await reserveForOrder(
    orderId,
    branchId,
    input.items.map((i) => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity })),
    SYSTEM_ACTOR,
  );
  if (!reservation.success) {
    throw new OrderCreationError(
      "موجودی یکی از اقلام سبد شما هم‌زمان توسط سفارش دیگری رزرو شد. لطفاً دوباره تلاش کنید.",
      "stock_conflict",
      { productId: reservation.insufficientItem.productId, variantId: reservation.insufficientItem.variantId },
    );
  }

  const pricing = await calculateCartPricing(input.items, { deliveryFee: deliveryFee.fee });

  const orderItems: OrderItem[] = pricing.items.map((line) => {
    const source = input.items.find((i) => i.lineId === line.lineId);
    return {
      lineId: line.lineId,
      productId: line.productId,
      variantId: source?.variantId ?? "",
      productName: source?.productName ?? "",
      variantLabel: source?.variantLabel ?? "",
      packagingLabel: source?.packagingLabel ?? "",
      quantity: line.quantity,
      unitPrice: line.unitBasePrice + line.packagingDelta,
      lineTotal: line.lineTotal,
    };
  });

  const paymentStatus =
    input.paymentMethod === "online"
      ? "pending"
      : input.paymentMethod === "card-to-card"
        ? "pending"
        : "not_required";

  const order: Order = {
    id: orderId,
    orderNumber: generateOrderNumber(),
    customer: input.customer,
    address: {
      ...input.address,
      latitude: customerCoordinates?.lat ?? null,
      longitude: customerCoordinates?.lng ?? null,
    },
    items: orderItems,
    subtotal: pricing.subtotal,
    discountTotal: pricing.productDiscountTotal + pricing.campaignDiscountTotal + pricing.couponDiscountTotal,
    deliveryFee: pricing.deliveryFee,
    deliveryFeeIsPending: pricing.deliveryFeeIsPending,
    total: pricing.total,
    deliveryMethod: input.deliveryMethod,
    branchId,
    branchName,
    paymentMethod: input.paymentMethod,
    status: input.paymentMethod === "online" ? "payment_pending" : "processing",
    paymentStatus,
    etaMinutesMin,
    etaMinutesMax,
    createdAt: now.toISOString(),
    cancelDeadline: new Date(now.getTime() + CANCEL_WINDOW_MS).toISOString(),
    idempotencyKey: input.idempotencyKey,
  };

  await db.orders.set(orderId, order);

  return order;
}

export function canCancelOrder(order: Order): boolean {
  if (order.status === "cancelled") return false;
  if (order.status !== "payment_pending" && order.status !== "processing" && order.status !== "paid") return false;
  return Date.now() <= new Date(order.cancelDeadline).getTime();
}
