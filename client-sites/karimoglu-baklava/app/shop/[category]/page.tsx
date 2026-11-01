import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ShopCategoryNav } from "@/components/shop/ShopCategoryNav";
import { FilterPanel } from "@/components/shop/FilterPanel";
import { MobileFilterBar } from "@/components/shop/MobileFilterBar";
import { ShopToolbar } from "@/components/shop/ShopToolbar";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { ShopEmptyState } from "@/components/shop/ShopEmptyState";
import { ShopPagination } from "@/components/shop/ShopPagination";
import { FaqAccordion } from "@/components/shop/FaqAccordion";
import { CategoryViewTracker } from "@/components/shop/CategoryViewTracker";
import { categoryShowcase } from "@/lib/mock-data";
import { getCatalogProducts } from "@/lib/server/catalog";
import { filterProducts, paginate, parseShopSearchParams, sortProducts } from "@/lib/shop";
import { buildListingCanonical } from "@/lib/seo/canonical";
import { generalFaq } from "@/lib/faq";
import { getArticlesForCategory } from "@/lib/content/articles";
import type { ProductCategory } from "@/lib/types";

// داده‌ها از PostgreSQL می‌آیند؛ صفحه نباید موقع Build (بدون دسترسی به دیتابیس) استاتیک ساخته و ثابت بماند.
export const dynamic = "force-dynamic";

interface CategoryPageProps {
  params: { category: string };
  searchParams: Record<string, string | string[] | undefined>;
}

function getCategory(slug: string) {
  return categoryShowcase.find((c) => c.id === slug);
}

export function generateStaticParams() {
  return categoryShowcase.map((c) => ({ category: c.id }));
}

export function generateMetadata({ params, searchParams }: CategoryPageProps): Metadata {
  const category = getCategory(params.category);
  if (!category) return {};

  const hasSearchOrFilter = Boolean(
    searchParams.q || searchParams.unit || searchParams.sort || searchParams.min || searchParams.max || searchParams.avail,
  );

  return {
    title: `خرید ${category.label}`,
    description: category.metaDescription,
    alternates: { canonical: buildListingCanonical(`/shop/${category.id}`, searchParams) },
    robots: hasSearchOrFilter ? { index: false, follow: true } : undefined,
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const category = getCategory(params.category);
  if (!category) notFound();

  const categoryId = category.id as ProductCategory;
  const filters = parseShopSearchParams(searchParams);
  const filtered = filterProducts(await getCatalogProducts(), filters, categoryId);
  const sorted = sortProducts(filtered, filters.sort);
  const { items, totalPages, currentPage, totalItems } = paginate(sorted, filters.page ?? 1);

  const hasActiveFilters = Boolean(
    filters.q || (filters.unit && filters.unit.length) || filters.onlyAvailable || filters.minPrice || filters.maxPrice,
  );

  const usp = new URLSearchParams(
    Object.entries(searchParams).flatMap(([k, v]) =>
      v === undefined ? [] : Array.isArray(v) ? v.map((x) => [k, x] as [string, string]) : [[k, v] as [string, string]],
    ),
  );

  const relatedCategories = categoryShowcase.filter((c) => c.id !== category.id).slice(0, 4);
  const relatedArticles = getArticlesForCategory(categoryId);

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `خرید ${category.label}`,
    description: category.metaDescription,
  };

  return (
    <div className="py-6 tablet:py-10">
      <CategoryViewTracker category={categoryId} />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <Container className="flex flex-col gap-6">
        <Breadcrumb
          items={[
            { label: "خانه", href: "/" },
            { label: "فروشگاه", href: "/shop" },
            { label: category.label },
          ]}
        />
        <div className="flex flex-col gap-2">
          <h1 className="text-h1Mobile tablet:text-h1 text-text-primary">{category.label}</h1>
          <p className="max-w-[70ch] text-body text-text-secondary">{category.intro}</p>
        </div>

        <ShopCategoryNav activeCategory={categoryId} />

        <Suspense fallback={<div className="h-11" />}>
          <MobileFilterBar resultCount={totalItems} />
        </Suspense>

        <div className="grid grid-cols-1 gap-8 desktop:grid-cols-[240px_1fr]">
          <aside className="hidden tablet:block" aria-label="فیلترها">
            <div className="sticky top-24 rounded-lg bg-surface p-4 shadow-sm">
              <Suspense fallback={<div className="h-64 animate-pulse rounded bg-bg-secondary" />}>
                <FilterPanel />
              </Suspense>
            </div>
          </aside>

          <div className="flex flex-col gap-6">
            <Suspense fallback={<div className="h-11 animate-pulse rounded bg-bg-secondary" />}>
              <ShopToolbar resultCount={totalItems} />
            </Suspense>

            {items.length > 0 ? (
              <>
                <ProductGrid products={items} />
                <ShopPagination
                  basePath={`/shop/${category.id}`}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  searchParams={usp}
                />
              </>
            ) : (
              <ShopEmptyState hasActiveFilters={hasActiveFilters} clearFiltersHref={`/shop/${category.id}`} />
            )}
          </div>
        </div>

        <section aria-labelledby="related-categories-heading" className="flex flex-col gap-3 pt-6">
          <h2 id="related-categories-heading" className="text-h3 text-text-primary">
            دسته‌بندی‌های مرتبط
          </h2>
          <div className="flex flex-wrap gap-2">
            {relatedCategories.map((c) => (
              <Link
                key={c.id}
                href={`/shop/${c.id}`}
                className="rounded-full border border-border-strong px-4 py-2 text-bodySm text-text-secondary hover:border-brand-black hover:text-text-primary"
              >
                {c.label}
              </Link>
            ))}
          </div>
        </section>

        <section aria-labelledby="faq-heading" className="flex flex-col gap-4 pt-4">
          <h2 id="faq-heading" className="text-h3 text-text-primary">
            سوالات متداول
          </h2>
          <FaqAccordion items={generalFaq} />
        </section>

        {relatedArticles.length > 0 && (
          <section aria-labelledby="related-articles-heading" className="flex flex-col gap-3 pt-4">
            <h2 id="related-articles-heading" className="text-h3 text-text-primary">
              راهنمای مرتبط
            </h2>
            <div className="flex flex-wrap gap-2">
              {relatedArticles.map((article) => (
                <Link
                  key={article.slug}
                  href={`/guide/${article.slug}`}
                  className="rounded-full border border-border-strong px-4 py-2 text-bodySm text-text-secondary hover:border-brand-black hover:text-text-primary"
                >
                  {article.title}
                </Link>
              ))}
            </div>
          </section>
        )}
      </Container>
    </div>
  );
}
