import type { MetadataRoute } from "next";
import { branches, categoryShowcase } from "@/lib/mock-data";
import { getCatalogProducts } from "@/lib/server/catalog";
import { getAllArticles } from "@/lib/content/articles";
import { SITE_URL } from "@/lib/seo/siteConfig";

/**
 * ===== Sitemap پویا (Prompt 12، بخش ۱۱) =====
 *
 * طبق الزام صریح: صفحات خصوصی (Cart/Checkout/Order/Payment/Admin/Auth)
 * هرگز اینجا نمی‌آیند — چون اصلاً به آن‌ها ارجاع داده نمی‌شود (نه چون
 * فیلتر شده‌اند؛ ساختار Sitemap فقط از کاتالوگ/شعب/محتوا می‌خواند، نه از
 * فهرست کامل Route های پروژه).
 *
 * فقط محصولاتِ فعال (`isAvailable`) به‌عنوان صفحات قابل خرید در نظر گرفته
 * می‌شوند؛ محصول غیرفعال هنوز صفحه‌اش زنده است (برای مشتریانی که لینک قدیمی
 * دارند) اما عمداً از Sitemap کنار گذاشته می‌شود تا موتور جستجو منابع
 * Crawl را روی صفحات واقعاً قابل خرید متمرکز کند.
 */
// محصولات از دیتابیس خوانده می‌شوند؛ Sitemap نباید موقع Build (بدون دسترسی به دیتابیس) ساخته و ثابت بماند.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // اگر دیتابیس در دسترس نباشد، Sitemap بدون صفحات محصول برگردانده می‌شود (به‌جای خطای ۵۰۰)
  const products = await getCatalogProducts().catch(() => []);

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/shop`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/branches`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/menu`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    // ===== صفحات جدید این مرحله (UI/UX Audit) — عمومی و قابل Index =====
    { url: `${SITE_URL}/cafe`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    // /account عمداً اینجا نیست — صفحه خصوصی (noindex)، رجوع به app/account/page.tsx و robots.ts
  ];

  const categoryEntries: MetadataRoute.Sitemap = categoryShowcase.map((category) => ({
    url: `${SITE_URL}/shop/${category.id}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const productEntries: MetadataRoute.Sitemap = products
    .filter((product) => product.isAvailable)
    .map((product) => ({
      url: `${SITE_URL}/product/${product.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

  const branchEntries: MetadataRoute.Sitemap = branches.map((branch) => ({
    url: `${SITE_URL}/branches/${branch.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  // فعلاً خالی (طبق بخش ۱۷: محتوای جعلی تولید نشده) — به‌محض افزودن اولین
  // مقاله واقعی به `lib/content/articles.ts`، همین‌جا خودکار ظاهر می‌شود.
  const articles = getAllArticles();
  const articleEntries: MetadataRoute.Sitemap =
    articles.length > 0
      ? [
          { url: `${SITE_URL}/guide`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.5 },
          ...articles.map((article) => ({
            url: `${SITE_URL}/guide/${article.slug}`,
            lastModified: new Date(article.publishedAt),
            changeFrequency: "monthly" as const,
            priority: 0.5,
          })),
        ]
      : [];

  return [...staticEntries, ...categoryEntries, ...productEntries, ...branchEntries, ...articleEntries];
}
