import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://webpikaso.ir";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Staff dashboard, customer account area and its API/server actions
      // have no SEO value and shouldn't be crawled or shown in results.
      disallow: ["/dashboard", "/account"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
