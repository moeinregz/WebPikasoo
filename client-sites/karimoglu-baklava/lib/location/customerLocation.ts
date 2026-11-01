/**
 * موقعیت مشتری (شهر و در صورت اجازه، مختصات) — فقط سمت مرورگر.
 *
 * مختصات از سه راه به‌دست می‌آید: GPS مرورگر، انتخاب روی نقشه نشان، یا انتخاب دستی شهر
 * (بدون مختصات). تشخیص شهر از روی مختصات با فاصله تا «مرکز شهر» انجام می‌شود.
 */

export type CustomerCity = "تهران" | "همدان";
export type Coordinates = { lat: number; lng: number };

export interface StoredLocation {
  city: CustomerCity | null;
  coordinates: Coordinates | null;
}

const STORAGE_KEY = "karimoglu:customer-location:v1";

/** مرکز تقریبی شهرها (برای تشخیص شهر از روی مختصات) */
const CITY_CENTERS: { city: CustomerCity; lat: number; lng: number }[] = [
  { city: "تهران", lat: 35.6892, lng: 51.389 },
  { city: "همدان", lat: 34.7992, lng: 48.5146 },
];

/** فاصله مجاز از مرکز شهر (کیلومتر)؛ بیشتر از این یعنی خارج از محدوده فعلی خدمات */
export const MAX_CITY_DISTANCE_KM = 60;

const EMPTY: StoredLocation = { city: null, coordinates: null };

export function loadLocation(): StoredLocation {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<StoredLocation>;
    const city = parsed.city === "تهران" || parsed.city === "همدان" ? parsed.city : null;
    const c = parsed.coordinates;
    const coordinates =
      c && Number.isFinite(c.lat) && Number.isFinite(c.lng) && Math.abs(c.lat) <= 90 && Math.abs(c.lng) <= 180
        ? { lat: c.lat, lng: c.lng }
        : null;
    return { city, coordinates };
  } catch {
    return EMPTY;
  }
}

export function saveLocation(location: StoredLocation): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(location));
  } catch {
    // حالت خصوصی/پر بودن حافظه: فقط ذخیره نمی‌شود، برنامه کار می‌کند
  }
}

/** فاصله خط مستقیم دو نقطه بر حسب کیلومتر (فرمول Haversine) */
export function haversineKm(a: Coordinates, b: Coordinates): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

export function detectCityFromCoordinates(point: Coordinates): { city: CustomerCity; distanceKm: number } | null {
  let best: { city: CustomerCity; distanceKm: number } | null = null;
  for (const center of CITY_CENTERS) {
    const distanceKm = haversineKm(point, center);
    if (!best || distanceKm < best.distanceKm) best = { city: center.city, distanceKm };
  }
  return best && best.distanceKm <= MAX_CITY_DISTANCE_KM ? best : null;
}

export type LocationRequestResult =
  | { ok: true; city: CustomerCity; coordinates: Coordinates }
  | { ok: false; message: string };

/** درخواست موقعیت از مرورگر و تبدیل آن به شهر. هرگز Reject نمی‌شود؛ پیام خطا برمی‌گرداند. */
export function requestBrowserLocation(): Promise<LocationRequestResult> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      resolve({ ok: false, message: "مرورگر شما دریافت موقعیت را پشتیبانی نمی‌کند. لطفاً شهر را دستی انتخاب کنید." });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coordinates = { lat: position.coords.latitude, lng: position.coords.longitude };
        const detected = detectCityFromCoordinates(coordinates);
        if (!detected) {
          resolve({
            ok: false,
            message: "موقعیت شما خارج از محدوده فعلی خدمات (تهران و همدان) است. اگر این‌طور نیست، شهر را دستی انتخاب کنید.",
          });
          return;
        }
        resolve({ ok: true, city: detected.city, coordinates });
      },
      (error) => {
        const message =
          error.code === error.PERMISSION_DENIED
            ? "دسترسی به موقعیت داده نشد. از تنظیمات مرورگر اجازه دهید یا شهر را دستی انتخاب کنید."
            : error.code === error.TIMEOUT
              ? "دریافت موقعیت بیش از حد طول کشید. دوباره تلاش کنید یا شهر را دستی انتخاب کنید."
              : "موقعیت شما در دسترس نیست. لطفاً شهر را دستی انتخاب کنید.";
        resolve({ ok: false, message });
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 5 * 60 * 1000 },
    );
  });
}
