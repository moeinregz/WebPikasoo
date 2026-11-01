import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/siteConfig";

/**
 * ===== robots.txt (Prompt 12، بخش ۱۲) =====
 *
 * قانون کلی: همه‌چیز مجاز است مگر مسیرهای خصوصی/بدون ارزش برای Index شدن.
 * `/api` هم Disallow شده — نه برای پنهان‌کاری (این‌ها همان‌طور هم بدون
 * Auth باز نمی‌شوند)، بلکه چون پاسخ JSON خام هرگز نباید در نتایج جستجو
 * ظاهر شود و صرفاً بودجه Crawl را هدر می‌دهد.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/cart", "/checkout", "/order", "/payment", "/account"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
