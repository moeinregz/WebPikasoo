import { getProductDetailById } from "@/lib/server/catalog";
import type { CartItem, CartItemPriceBreakdown, CartPricingResult } from "@/lib/types";

/**
 * تنها منبع حقیقت قیمت در کل سیستم — طبق تاکید صریح Prompt 7 (بخش ۲):
 * «قیمت‌های مهم هرگز نباید از سمت فرانت‌اند قابل اعتماد باشند». این تابع
 * هرگز از قیمت ارسالی توسط کلاینت (`unitPriceSnapshot`) برای محاسبه استفاده
 * نمی‌کند — آن مقدار فقط برای تشخیص «تغییر قیمت» (`priceChanged`) با آن
 * مقایسه می‌شود. قیمت واقعی همیشه از کاتالوگ سمت سرور (`getProductDetailById`)
 * خوانده می‌شود.
 *
 * هزینه ارسال دیگر داخل این فایل محاسبه نمی‌شود — طبق تصمیم ماژول انتخاب
 * شعبه (Prompt 8)، `deliveryFee` باید از نتیجه واقعی
 * `selectBranchForOrder`/`calculateDeliveryFee` (که فاصله واقعی/فرمول را
 * می‌شناسد) به این تابع تزریق شود؛ این‌جا فقط جمع می‌زند، حدس نمی‌زند.
 */
export async function priceCartItem(item: CartItem): Promise<CartItemPriceBreakdown> {
  const product = await getProductDetailById(item.productId);

  if (!product) {
    return {
      lineId: item.lineId,
      productId: item.productId,
      unitBasePrice: 0,
      packagingDelta: 0,
      quantity: item.quantity,
      lineSubtotal: 0,
      productDiscountAmount: 0,
      lineTotal: 0,
      priceChanged: true,
    };
  }

  const saleGroup = product.saleTypes.find((g) => g.type === item.saleType);
  const variant = saleGroup?.variants.find((v) => v.id === item.variantId);
  const packaging = product.packagingOptions.find((p) => p.id === item.packagingId);

  const unitBasePrice = variant?.price ?? 0;
  const packagingDelta = packaging?.priceDelta ?? 0;
  const unitPrice = unitBasePrice + packagingDelta;

  const lineSubtotal = unitPrice * item.quantity;
  const discountPercent = product.discountPercent ?? 0;
  const productDiscountAmount = Math.round(unitBasePrice * (discountPercent / 100)) * item.quantity;
  const lineTotal = lineSubtotal - productDiscountAmount;

  return {
    lineId: item.lineId,
    productId: item.productId,
    unitBasePrice,
    packagingDelta,
    quantity: item.quantity,
    lineSubtotal,
    productDiscountAmount,
    lineTotal,
    priceChanged: Math.abs(item.unitPriceSnapshot - unitPrice) > 0,
  };
}

export async function calculateCartPricing(
  items: CartItem[],
  options: {
    /** null یا undefined یعنی هزینه ارسال هنوز مشخص نیست (در انتظار فرمول/فاصله) */
    deliveryFee?: number | null;
    couponCode?: string;
  } = {},
): Promise<CartPricingResult> {
  const lines = await Promise.all(items.map(priceCartItem));

  const subtotal = lines.reduce((sum, l) => sum + l.lineSubtotal, 0);
  const productDiscountTotal = lines.reduce((sum, l) => sum + l.productDiscountAmount, 0);

  // کمپین/کد تخفیف: طبق Blueprint، این سیستم برای Phase 2 برنامه‌ریزی شده
  // است؛ معماری (فیلد couponCode/couponError) از همین حالا آماده است، اما
  // هیچ کد فعالی وجود ندارد — صادقانه اعلام می‌شود، نه شبیه‌سازی جعلی.
  const campaignDiscountTotal = 0;
  const couponDiscountTotal = 0;
  let couponError: string | undefined;
  if (options.couponCode) {
    couponError = "کد تخفیف در حال حاضر فعال نیست.";
  }

  const deliveryFeeIsPending = options.deliveryFee === null || options.deliveryFee === undefined;
  const deliveryFee = deliveryFeeIsPending ? 0 : options.deliveryFee!;

  const total =
    subtotal - productDiscountTotal - campaignDiscountTotal - couponDiscountTotal + deliveryFee;

  return {
    items: lines,
    subtotal,
    productDiscountTotal,
    campaignDiscountTotal,
    couponDiscountTotal,
    deliveryFee,
    deliveryFeeIsPending,
    total,
    couponCode: options.couponCode,
    couponError,
  };
}
