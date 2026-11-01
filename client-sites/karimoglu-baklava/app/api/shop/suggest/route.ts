import { NextResponse } from "next/server";
import { getCatalogProducts } from "@/lib/server/catalog";

export const dynamic = "force-dynamic";

/**
 * پیشنهادهای جستجوی فروشگاه (حداکثر ۵ مورد) + تعداد کل نتایج.
 * فقط محصولات قابل‌مشاهده در فروشگاه آنلاین؛ داده عمومی است و نیازی به ورود ندارد.
 */
export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim().slice(0, 80) ?? "";
  if (!q) return NextResponse.json({ items: [], total: 0 });

  const matches = (await getCatalogProducts()).filter((p) => p.name.includes(q));
  return NextResponse.json({
    total: matches.length,
    items: matches.slice(0, 5).map((p) => ({ id: p.id, slug: p.slug, name: p.name, categoryLabel: p.categoryLabel })),
  });
}
