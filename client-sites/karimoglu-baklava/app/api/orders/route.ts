import { NextResponse } from "next/server";
import { createOrder, OrderCreationError } from "@/lib/server/orderService";
import { getPaymentProvider } from "@/lib/payment/registry";
import { findPendingPaymentByOrderId } from "@/lib/server/paymentRepo";
import { assertSameOrigin, jsonError } from "@/lib/server/security";
import { enforceRateLimit } from "@/lib/server/rateLimit";
import type { CartItem, CustomerInfo, DeliveryAddress, DeliveryMethod, PaymentMethod } from "@/lib/types";

interface CreateOrderBody {
  items?: CartItem[];
  customer?: CustomerInfo;
  address?: DeliveryAddress;
  deliveryMethod?: DeliveryMethod;
  paymentMethod?: PaymentMethod;
  idempotencyKey?: string;
  preferredBranchId?: string;
}

function validateBody(body: CreateOrderBody): string | null {
  if (!Array.isArray(body.items) || body.items.length === 0) return "سبد خرید خالی است.";
  if (!body.customer?.name || !body.customer?.phone) return "نام و شماره موبایل الزامی است.";
  if (!body.address?.fullAddress || !body.address?.city) return "آدرس تحویل الزامی است.";
  if (!body.deliveryMethod) return "روش ارسال باید مشخص شود.";
  if (!body.paymentMethod) return "روش پرداخت باید مشخص شود.";
  if (!body.idempotencyKey) return "کلید Idempotency الزامی است.";
  return null;
}

export async function POST(request: Request) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;

  // جلوگیری از سفارش‌سازی انبوه/Bot (که هم می‌تواند موجودی را بی‌دلیل Reserve
  // کند و هم منابع Backend را مصرف کند) از یک IP — با سقف نسبتاً بازتر از
  // لاگین چون کاربران واقعی هم ممکن است چند سفارش پشت سر هم ثبت کنند.
  const limited = enforceRateLimit(request, { key: "orders:create", limit: 20, windowMs: 15 * 60 * 1000 });
  if (limited) return limited;

  let body: CreateOrderBody;
  try {
    body = await request.json();
  } catch {
    return jsonError("بدنه درخواست نامعتبر است.", 400);
  }

  const validationError = validateBody(body);
  if (validationError) return jsonError(validationError, 400);

  try {
    // مرحله ۱ تا ۷ (اعتبارسنجی سبد، محاسبه مجدد قیمت، بررسی موجودی، تعیین
    // شعبه، محاسبه هزینه ارسال، ایجاد سفارش) همگی داخل createOrder اجرا می‌شوند.
    const order = await createOrder({
      items: body.items!,
      customer: body.customer!,
      address: body.address!,
      deliveryMethod: body.deliveryMethod!,
      paymentMethod: body.paymentMethod!,
      idempotencyKey: body.idempotencyKey!,
      preferredBranchId: body.preferredBranchId,
    });

    // مرحله ۸-۹: در صورت پرداخت آنلاین، تراکنش ایجاد و کاربر به درگاه هدایت شود.
    // اگر این درخواست تکراری (همان idempotencyKey) بود، `createOrder` سفارش
    // قبلی را برگردانده — در این حالت نباید یک تراکنش پرداخت جدید ساخت؛
    // تراکنش در‌انتظار قبلی (در صورت وجود) دوباره استفاده می‌شود.
    if (order.paymentMethod === "online" && order.paymentStatus === "pending") {
      const existingTransaction = await findPendingPaymentByOrderId(order.id);
      if (existingTransaction) {
        return NextResponse.json(
          {
            order,
            payment: {
              transactionId: existingTransaction.id,
              redirectUrl: `/payment/mock/${existingTransaction.id}`,
              status: existingTransaction.status,
            },
          },
          { status: 201 },
        );
      }

      const provider = getPaymentProvider();
      const payment = await provider.initiate({ orderId: order.id, amount: order.total });
      return NextResponse.json({ order, payment }, { status: 201 });
    }

    return NextResponse.json({ order, payment: null }, { status: 201 });
  } catch (error) {
    if (error instanceof OrderCreationError) {
      return jsonError(error.message, 409, { code: error.code, details: error.details });
    }
    // eslint-disable-next-line no-console
    console.error("[orders:create] unexpected error", error);
    return jsonError("خطای غیرمنتظره در ایجاد سفارش رخ داد.", 500);
  }
}
