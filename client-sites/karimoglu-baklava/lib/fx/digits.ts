/** تبدیل عدد به ارقام فارسی (برای شمارنده‌های انیمیشنی) */
export function toFaDigits(value: number | string): string {
  return String(value).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)] ?? d);
}
