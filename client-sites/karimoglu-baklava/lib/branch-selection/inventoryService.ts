import { checkCartAvailability, getBranchStock, manualSetStock } from "@/lib/inventory/core";
import { getAvailable } from "@/lib/inventory/types";
import { SYSTEM_ACTOR } from "@/lib/inventory/rbac";

/**
 * ⚠️ این فایل دیگر منبع منطق موجودی نیست — طبق الزام صریح Prompt 9 («منطق
 * موجودی را در چند قسمت مختلف کپی نکن»)، منطق واقعی حالا یک‌جا در
 * `lib/inventory/core.ts` (به‌همراه `lib/inventory/store.ts` برای ذخیره‌سازی)
 * پیاده شده است. این فایل صرفاً یک لایه نازک سازگاری (Adapter) است تا ماژول
 * انتخاب هوشمند شعبه (`branchSelectionService.ts`) بدون نیاز به تغییر امضای
 * فراخوانی‌هایش، به سرویس مرکزی جدید متصل شود.
 *
 * تفاوت مهم نسبت به نسخه قبلی (Prompt 8): موجودی حالا در سطح «شعبه + محصول +
 * Variant» است، نه فقط «شعبه + محصول» — چون واحد واقعی فروش، Variant است
 * (مثلاً ۵۰۰ گرم در برابر ۱ کیلو). به همین دلیل امضای توابع زیر یک فیلد
 * `variantId` اضافه دارد؛ این تغییر در `branchSelectionService.ts` نیز اعمال
 * شده است.
 */

export interface StockCheckItem {
  productId: string;
  variantId: string;
  quantity: number;
}

export async function getStock(branchId: string, productId: string, variantId: string): Promise<number> {
  return getAvailable(await getBranchStock(branchId, productId, variantId));
}

export async function hasSufficientStockForCart(
  branchId: string,
  items: StockCheckItem[],
): Promise<{ sufficient: boolean; missingProductIds: string[] }> {
  const check = await checkCartAvailability(branchId, items);
  return {
    sufficient: check.sufficient,
    missingProductIds: [...new Set(check.insufficientItems.map((i) => i.productId))],
  };
}

/**
 * فقط برای تست — رزرو/آزادسازی واقعی حالا از طریق `lib/inventory/core.ts`
 * (`reserveForOrder` / `releaseReservation`) با `orderId` مشخص انجام می‌شود؛
 * این تابع صرفاً برای راه‌اندازی سریع یک مقدار موجودی قطعی در تست‌های همین
 * ماژول باقی مانده تا تست‌های Prompt 8 بدون تغییر معنایی همچنان معتبر بمانند.
 */
export async function __setStockForTest(branchId: string, productId: string, variantId: string, quantity: number): Promise<void> {
  const current = await getBranchStock(branchId, productId, variantId);
  await manualSetStock(branchId, productId, variantId, quantity + current.reserved, "تنظیم مقدار برای تست", SYSTEM_ACTOR);
}
