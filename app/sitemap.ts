import type { MetadataRoute } from "next";
import { getPublishedBlogPosts } from "@/lib/db";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://webpikaso.ir";

// Regenerated at most once an hour — new blog posts show up in the sitemap
// without needing a full redeploy.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/about`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/portfolio`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/skills`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/blog`, changeFrequency: "daily", priority: 0.8 },
    { url: `${siteUrl}/contact`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/order`, changeFrequency: "monthly", priority: 0.6 },
  ];

  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const posts = await getPublishedBlogPosts();
    blogPages = posts.map((post) => ({
      url: `${siteUrl}/blog/${encodeURIComponent(post.slug)}`,
      lastModified: new Date(post.updated_at.replace(" ", "T") + "Z"),
      changeFrequency: "monthly",
      priority: 0.7,
    }));
  } catch {
    // Sitemap generation must never 500 the whole route because the DB
    // was briefly unreachable — just ship the static pages that turn.
  }

  return [...staticPages, ...blogPages];
}
