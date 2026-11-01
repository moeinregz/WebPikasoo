import type { ProductCategory } from "@/lib/types";

/**
 * ===== معماری Content Hub / راهنما (Prompt 12، بخش ۱۷) =====
 *
 * طبق دستور صریح: «اگر Content آماده نیست، معماری را آماده کن و محتوای
 * جعلی تولید نکن». بنابراین آرایه زیر عمداً خالی است — نه چون فراموش شده،
 * بلکه چون هیچ مقاله واقعی هنوز نوشته نشده. صفحات `/guide` و `/guide/[slug]`
 * کاملاً کاربردی‌اند و همین الان قابل Deploy هستند؛ به‌محض افزودن یک آیتم
 * واقعی به این آرایه (توسط تیم محتوا)، بدون هیچ تغییر کد دیگری:
 *   ۱) در Sitemap ظاهر می‌شود (`app/sitemap.ts` را هم باید وصل کرد وقتی
 *      اولین مقاله واقعی اضافه شد)
 *   ۲) صفحه‌اش با Metadata/Canonical/Breadcrumb کامل رندر می‌شود
 *   ۳) در صفحه Category مرتبط به‌عنوان Internal Link ظاهر می‌شود (بخش ۱۶)
 *
 * موضوعات پیشنهادی Prompt (فقط به‌عنوان راهنمای ساختار، نه محتوای واقعی):
 * راهنمای خرید باقلوا، تفاوت انواع باقلوا، باقلوا استانبولی/عربی چیست،
 * راهنمای بسته‌بندی، نگهداری باقلوا، مناسبت‌ها و هدیه، معرفی شعب.
 */

export interface Article {
  slug: string;
  title: string;
  metaDescription: string;
  /** اگر مقاله به یک دسته محصول خاص مرتبط است — برای Internal Linking دوطرفه (بخش ۱۶) */
  relatedCategory?: ProductCategory;
  publishedAt: string; // ISO date
  /** بدنه واقعی مقاله — Markdown یا HTML امن؛ فعلاً هیچ مقاله‌ای این فیلد را پر نکرده */
  bodyHtml: string;
}

/**
 * منبع حقیقت مقالات — در فاز بعدی می‌تواند از CMS/دیتابیس واقعی جایگزین
 * شود بدون تغییر در صفحات `app/guide/*` (که فقط از این دو تابع می‌خوانند).
 */
export const articles: Article[] = [];

export function getAllArticles(): Article[] {
  return articles;
}

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

export function getArticlesForCategory(category: ProductCategory): Article[] {
  return articles.filter((a) => a.relatedCategory === category);
}
