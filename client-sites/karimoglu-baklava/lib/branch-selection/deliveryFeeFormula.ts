import type { DeliveryMethod } from "@/lib/types";
import type { DeliveryFeeResult } from "./types";

/**
 * طبق تاکید صریح Prompt 8 (بخش ۶): «فرمول دقیق قیمت‌گذاری فعلاً مشخص نشده...
 * عدد یا فرمول ساختگی وارد نکن». بنابراین `baseFee` و `perKmRate` عمداً
 * `null` هستند — نه یک عدد نمونه با کامنت «Placeholder». وقتی این مقادیر
 * تعیین شدند (تصمیم عملیاتی/مالی کسب‌وکار، نه تصمیم فنی)، فقط همین شیء
 * پیکربندی باید پر شود؛ هیچ کد دیگری نیاز به تغییر ندارد.
 */
export interface DeliveryFeeFormulaConfig {
  baseFee: number | null;
  perKmRate: number | null;
}

export const deliveryFeeFormulaConfig: DeliveryFeeFormulaConfig = {
  baseFee: null, // TODO: تعیین توسط کسب‌وکار
  perKmRate: null, // TODO: تعیین توسط کسب‌وکار
};

export function calculateDeliveryFee(
  distanceKm: number | null,
  _method: DeliveryMethod,
  config: DeliveryFeeFormulaConfig = deliveryFeeFormulaConfig,
): DeliveryFeeResult {
  if (config.baseFee === null || config.perKmRate === null) {
    return { fee: null, isEstimate: false, reason: "formula_not_configured" };
  }
  if (distanceKm === null) {
    return { fee: null, isEstimate: false, reason: "distance_unknown" };
  }
  const fee = Math.round(config.baseFee + config.perKmRate * distanceKm);
  return { fee, isEstimate: true };
}
