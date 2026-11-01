/**
 * ===== پیکربندی مرکزی SEO (Prompt 12) =====
 *
 * `siteUrl` قبلاً به‌صورت جداگانه در `app/layout.tsx` تعریف شده بود؛ حالا
 * اینجا یک‌جا نگه داشته می‌شود تا `app/sitemap.ts`، `app/robots.ts`، و هر
 * تولیدکننده JSON-LD (LocalBusiness/Product/Breadcrumb) همه از یک منبع
 * واحد بخوانند — طبق همان اصل «منطق را در چند جا تکرار نکن» که در
 * Promptهای قبلی هم رعایت شده.
 *
 * دامنه نهایی سایت: baklavakarimoglu.com (همه Sitemap/Robots/Canonical/JSON-LD از همین یک خط می‌خوانند).
 */
export const SITE_URL = "https://baklavakarimoglu.com";

export const SITE_NAME = "باقلوا کریم‌اوغلو";

/** مسیرهایی که هرگز نباید در Sitemap ظاهر شوند یا توسط موتورهای جستجو Index شوند */
export const PRIVATE_PATH_PREFIXES = ["/admin", "/api", "/cart", "/checkout", "/order", "/payment"] as const;

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}
