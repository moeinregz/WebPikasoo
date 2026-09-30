import "@/lib/db/bootstrap";
import { db } from "@/lib/db/client";
import type { ProductSummary } from "@/lib/types";

/**
 * عکس‌های محصولات فروشگاه از جدول `product_images` (همان جدولی که فرم ادمین
 * در آن می‌نویسد) خوانده می‌شود. کاتالوگ فروشگاه هنوز از `lib/mock-data.ts`
 * می‌آید و شناسه محصولات (rm1، rm2، ...) با ردیف‌های دیتابیس یکی است؛ پس
 * عکس‌ها بر اساس `product.id` به آن اضافه می‌شوند.
 *
 * اگر خواندن دیتابیس به هر دلیلی شکست بخورد، سایت بدون عکس (با Placeholder)
 * به کار خود ادامه می‌دهد و صفحه خراب نمی‌شود.
 */

function isRenderableImageUrl(url: string): boolean {
  return url.startsWith("/uploads/") || /^https?:\/\//i.test(url);
}

export function getProductImageUrls(productId: string): string[] {
  try {
    const rows = db
      .prepare("SELECT url FROM product_images WHERE product_id = ? ORDER BY sort_order")
      .all(productId) as { url: string }[];
    return rows.map((r) => r.url).filter((u) => u && isRenderableImageUrl(u));
  } catch {
    return [];
  }
}

/** اولین عکس هر محصول را (اگر داشته باشد) به‌صورت `imageUrl` به آن اضافه می‌کند */
export function attachProductImages<T extends ProductSummary>(products: T[]): T[] {
  if (products.length === 0) return products;
  try {
    const rows = db
      .prepare("SELECT product_id, url FROM product_images ORDER BY product_id, sort_order")
      .all() as { product_id: string; url: string }[];
    const first = new Map<string, string>();
    for (const row of rows) {
      if (!first.has(row.product_id) && row.url && isRenderableImageUrl(row.url)) first.set(row.product_id, row.url);
    }
    return products.map((p) => (first.has(p.id) ? { ...p, imageUrl: first.get(p.id) } : p));
  } catch {
    return products;
  }
}
