import type { BranchSummary, DeliveryMethod } from "@/lib/types";
import type { CustomerLocationInput, RejectionReason } from "./types";
import { haversineDistanceService } from "./distanceService";

export interface FeasibilityCheckResult {
  feasible: boolean;
  reason?: Extract<RejectionReason, "delivery_method_unsupported" | "out_of_service_area">;
}

/**
 * چون مختصات و محدوده دقیق سرویس‌دهی شعب هنوز TODO است (Blueprint بخش ۳۰)،
 * این سرویس در نبود آن داده از یک قانون موقت و صریح استفاده می‌کند: تطابق
 * شهر مشتری با شهر شعبه («Rule-based Fallback» — همان تصمیم ثبت‌شده در
 * Blueprint بخش ۹). با تکمیل مختصات/شعاع سرویس‌دهی، این تابع باید بر اساس
 * `branch.serviceRadiusKm` و فاصله واقعی تصمیم بگیرد؛ امضای تابع تغییر نمی‌کند.
 */
export function checkDeliveryFeasibility(
  branch: BranchSummary,
  location: CustomerLocationInput,
  deliveryMethod: DeliveryMethod,
): FeasibilityCheckResult {
  if (!branch.supportedDeliveryMethods.includes(deliveryMethod)) {
    return { feasible: false, reason: "delivery_method_unsupported" };
  }

  // اگر برای شعبه شعاع سرویس‌دهی تعیین شده باشد (serviceRadiusKm) و مختصات هر دو طرف معلوم باشد،
  // مشتریِ دورتر از آن شعاع از این شعبه سرویس نمی‌گیرد. (فعلاً برای همه شعب null است = بدون محدودیت.)
  if (branch.serviceRadiusKm !== null && branch.coordinates && location.coordinates) {
    const { distanceKm } = haversineDistanceService.calculate(branch.coordinates, location.coordinates);
    if (distanceKm > branch.serviceRadiusKm) {
      return { feasible: false, reason: "out_of_service_area" };
    }
  }

  // Fallback فعلی: تطابق شهر
  if (location.city && location.city !== branch.city) {
    return { feasible: false, reason: "out_of_service_area" };
  }

  return { feasible: true };
}
