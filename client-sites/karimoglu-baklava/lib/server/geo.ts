export type Coordinates = { lat: number; lng: number };

/** مختصات دریافتی از کلاینت را اعتبارسنجی می‌کند؛ هر مقدار نامعتبر (رشته، NaN، خارج از بازه) به `null` تبدیل می‌شود. */
export function sanitizeCoordinates(value: unknown): Coordinates | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as { lat?: unknown; lng?: unknown };
  if (typeof raw.lat !== "number" || typeof raw.lng !== "number") return null;
  if (!Number.isFinite(raw.lat) || !Number.isFinite(raw.lng)) return null;
  if (Math.abs(raw.lat) > 90 || Math.abs(raw.lng) > 180) return null;
  return { lat: raw.lat, lng: raw.lng };
}
