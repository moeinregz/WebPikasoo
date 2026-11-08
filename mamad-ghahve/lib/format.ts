const FA = "۰۱۲۳۴۵۶۷۸۹";

export function faNum(n: number | string): string {
  return String(n).replace(/\d/g, (d) => FA[+d]);
}

export function toman(n: number): string {
  return Number(n || 0).toLocaleString("fa-IR") + " تومان";
}

export function faInt(n: number): string {
  return Number(n || 0).toLocaleString("fa-IR");
}

/** ارقام فارسی/عربی رو به لاتین تبدیل می‌کنه (برای ورودی شماره موبایل و ...) */
export function toEnDigits(s: string): string {
  return String(s || "")
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
}

export function normalizePhone(s: string): string | null {
  let p = toEnDigits(s).replace(/[\s\-()]/g, "");
  if (p.startsWith("+98")) p = "0" + p.slice(3);
  else if (p.startsWith("0098")) p = "0" + p.slice(4);
  else if (p.startsWith("98") && p.length === 12) p = "0" + p.slice(2);
  else if (p.startsWith("9") && p.length === 10) p = "0" + p;
  return /^09\d{9}$/.test(p) ? p : null;
}

export function faDate(sqlDate: string): string {
  if (!sqlDate) return "";
  const d = new Date(sqlDate.replace(" ", "T") + "Z");
  return d.toLocaleDateString("fa-IR", { year: "numeric", month: "long", day: "numeric" });
}

export function faDateTime(sqlDate: string): string {
  if (!sqlDate) return "";
  const d = new Date(sqlDate.replace(" ", "T") + "Z");
  return d.toLocaleString("fa-IR", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Tehran" });
}

export function discountPercent(price: number, compare: number): number {
  if (!compare || compare <= price) return 0;
  return Math.round(((compare - price) / compare) * 100);
}

export const ORDER_STATUS: Record<string, { label: string; tone: string }> = {
  pending: { label: "در انتظار پرداخت", tone: "warn" },
  paid: { label: "پرداخت شده", tone: "ok" },
  processing: { label: "در حال آماده‌سازی", tone: "info" },
  shipped: { label: "ارسال شده", tone: "info" },
  delivered: { label: "تحویل شده", tone: "ok" },
  cancelled: { label: "لغو شده", tone: "bad" },
  failed: { label: "پرداخت ناموفق", tone: "bad" },
};
