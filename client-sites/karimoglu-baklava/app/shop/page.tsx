import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ShopCategoryNav } from "@/components/shop/ShopCategoryNav";
import { FilterPanel } from "@/components/shop/FilterPanel";
import { MobileFilterBar } from "@/components/shop/MobileFilterBar";
import { ShopToolbar } from "@/components/shop/ShopToolbar";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { ProductGridSkeleton } from "@/components/shop/ProductGridSkeleton";
import { ShopEmptyState } from "@/components/shop/ShopEmptyState";
import { ShopPagination } from "@/components/shop/ShopPagination";
import { getCatalogProducts } from "@/lib/server/catalog";
import { filterProducts, paginate, parseShopSearchParams, sortProducts } from "@/lib/shop";
import { buildListingCanonical } from "@/lib/seo/canonical";

// داده‌ها از PostgreSQL می‌آیند؛ صفحه نباید موقع Build (بدون دسترسی به دیتابیس) استاتیک ساخته و ثابت بماند.
export const dynamic = "force-dynamic";

interface ShopPageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

/**
 * طبق بخش ۱۳/۱۴ Prompt 12: صفحه ۱ بدون فیلتر → Canonical به `/shop`.
 * صفحه N>۱ → Canonical خودارجاع (`/shop?page=N`) چون محتوای واقعاً متفاوتی
 * دارد. هر نوع فیلتر/جستجو (`q`, `unit`, `sort`, ...) → `noindex` (نه
 * `disallow`؛ باید Crawl و از صفحه پیمایش شود، فقط در نتایج جستجو ظاهر
 * نشود) تا موتور جستجو با هزاران URL ترکیبی از فیلترها شلوغ نشود — دقیقاً
 * الزام صریح بخش ۱۴ («Search داخلی نباید هزاران URL قابل ایندکس بسازد»).
 */
export function generateMetadata({ searchParams }: ShopPageProps): Metadata {
  const hasSearchOrFilter = Boolean(
    searchParams.q || searchParams.unit || searchParams.sort || searchParams.min || searchParams.max || searchParams.avail,
  );

  return {
    title: "فروشگاه",
    description: "خرید آنلاین باقلوا، استانبولی، باقلوا عربی، شیرینی خشک، دنر کباب و فست‌فود از باقلوا کریم‌اوغلو.",
    alternates: { canonical: buildListingCanonical("/shop", searchParams) },
    robots: hasSearchOrFilter ? { index: false, follow: true } : undefined,
  };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const filters = parseShopSearchParams(searchParams);
  const filtered = filterProducts(await getCatalogProducts(), filters);
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

  return (
    <div className="py-6 tablet:py-10">
      <Container className="flex flex-col gap-6">
        <Breadcrumb items={[{ label: "خانه", href: "/" }, { label: "فروشگاه" }]} />
        <h1 className="text-h1Mobile tablet:text-h1 text-text-primary">فروشگاه</h1>

        <ShopCategoryNav />

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
                  basePath="/shop"
                  currentPage={currentPage}
                  totalPages={totalPages}
                  searchParams={usp}
                />
              </>
            ) : (
              <ShopEmptyState hasActiveFilters={hasActiveFilters} clearFiltersHref="/shop" />
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
