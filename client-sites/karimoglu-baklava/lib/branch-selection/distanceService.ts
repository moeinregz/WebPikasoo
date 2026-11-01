import type { DistanceResult } from "./types";

export interface GeoPoint {
  lat: number;
  lng: number;
}

/**
 * طبق تاکید صریح Prompt: «سرویس محاسبه فاصله باید قابل تعویض باشد» و
 * «مختصات یا آدرس جعلی ایجاد نکن». این ماژول یک Interface ثابت (`DistanceService`)
 * تعریف می‌کند تا پیاده‌سازی پشت آن — بدون تغییر در کد مصرف‌کننده
 * (`branchSelectionService`) — قابل جایگزینی باشد.
 */
export interface DistanceService {
  calculate(origin: GeoPoint, destination: GeoPoint): DistanceResult;
}

/**
 * پیاده‌سازی آماده برای زمانی که مختصات واقعی شعب/مشتری در دسترس باشد.
 * فرمول Haversine فاصله مستقیم (خط هوایی) را محاسبه می‌کند؛ می‌تواند بعداً با
 * یک سرویس مسیریابی واقعی (مثل Neshan/Google Distance Matrix API، طبق
 * Blueprint بخش ۳۲) جایگزین شود — امضای Interface تغییر نمی‌کند.
 */
export const haversineDistanceService: DistanceService = {
  calculate(origin, destination) {
    const R = 6371; // شعاع زمین به کیلومتر
    const dLat = ((destination.lat - origin.lat) * Math.PI) / 180;
    const dLng = ((destination.lng - origin.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((origin.lat * Math.PI) / 180) *
        Math.cos((destination.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = Math.round(R * c * 10) / 10;
    // تخمین زمان تقریبی مسیر با سرعت متوسط شهری فرضی ۲۵ کیلومتر بر ساعت —
    // TODO: با اتصال سرویس مسیریابی واقعی، این تخمین با زمان واقعی ترافیک جایگزین شود
    const durationMinutes = Math.round((distanceKm / 25) * 60);
    return { distanceKm, durationMinutes };
  },
};

/**
 * چون مختصات شعب و اغلب مشتریان فعلاً TODO است (Blueprint بخش ۳۰)، Provider
 * فعال سیستم این پیاده‌سازی «تهی» است — به‌جای حدس زدن فاصله، صراحتاً اعلام
 * می‌کند فاصله قابل‌محاسبه نیست. `branchSelectionService` باید این حالت را
 * مدیریت کند (نه این‌که مقدار پیش‌فرض بسازد).
 */
export function calculateDistanceIfPossible(
  service: DistanceService | null,
  origin: GeoPoint | null,
  destination: GeoPoint | null,
): DistanceResult | null {
  if (!service || !origin || !destination) return null;
  return service.calculate(origin, destination);
}

/** Provider فعال فعلی سیستم — با تکمیل مختصات، به `haversineDistanceService` (یا سرویس واقعی) تغییر می‌کند */
export const activeDistanceService: DistanceService | null = haversineDistanceService;
