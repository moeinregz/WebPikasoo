import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { getAllArticles } from "@/lib/content/articles";

export const metadata: Metadata = {
  title: "راهنمای خرید و شناخت باقلوا",
  description: "راهنماها و مقالات باقلوا کریم‌اوغلو درباره انواع باقلوا، بسته‌بندی، نگهداری و مناسبت‌های هدیه.",
  alternates: { canonical: "/guide" },
};

export default function GuideIndexPage() {
  const articles = getAllArticles();

  return (
    <div className="py-6 tablet:py-10">
      <Container className="flex flex-col gap-8">
        <Breadcrumb items={[{ label: "خانه", href: "/" }, { label: "راهنما" }]} />

        <div className="flex flex-col gap-2">
          <h1 className="text-h1Mobile tablet:text-h1 text-text-primary">راهنمای خرید و شناخت باقلوا</h1>
          <p className="max-w-[70ch] text-body text-text-secondary">
            راهنماهای کاربردی درباره انواع باقلوا، تفاوت باقلوا استانبولی و عربی، بسته‌بندی، نگهداری و انتخاب هدیه —
            به‌زودی تکمیل می‌شود.
          </p>
        </div>

        {articles.length === 0 ? (
          <div className="rounded-lg bg-surface p-8 text-center text-bodySm text-text-muted shadow-sm">
            محتوای این بخش در حال آماده‌سازی است.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2 desktop:grid-cols-3">
            {articles.map((article) => (
              <Link
                key={article.slug}
                href={`/guide/${article.slug}`}
                className="flex flex-col gap-2 rounded-lg bg-surface p-4 shadow-sm hover:ring-1 hover:ring-brand-black"
              >
                <p className="text-h4 text-text-primary">{article.title}</p>
                <p className="text-bodySm text-text-secondary">{article.metaDescription}</p>
              </Link>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-3 pt-2">
          <Link href="/shop" className="rounded-md bg-brand-black px-5 py-2.5 text-bodySm text-white">
            مشاهده فروشگاه
          </Link>
        </div>
      </Container>
    </div>
  );
}
