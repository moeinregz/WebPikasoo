import type { ProductCategory, ProductSummary, ShopFilterState, SortOption } from "./types";

export const PAGE_SIZE = 12;

/**
 * این توابع کاملاً روی داده Placeholder سمت کلاینت کار می‌کنند تا چیدمان/تعامل
 * Shop قابل نمایش باشد. در معماری واقعی (طبق Blueprint، بخش ۱۷)، این منطق باید
 * به Query Parameterهای واقعی `GET /api/v1/products` منتقل شود (فیلتر/مرتب‌سازی/
 * صفحه‌بندی سمت Backend انجام شود، نه سمت کلاینت روی کل کاتالوگ).
 */
export function filterProducts(
  products: ProductSummary[],
  filters: ShopFilterState,
  category?: ProductCategory,
): ProductSummary[] {
  return products.filter((p) => {
    if (category && p.category !== category) return false;
    if (filters.q) {
      const q = filters.q.trim();
      if (q && !p.name.includes(q) && !p.categoryLabel.includes(q)) return false;
    }
    if (filters.unit && filters.unit.length > 0 && !(p.availableSaleTypes ?? [p.unitType]).some((t) => filters.unit!.includes(t))) {
      return false;
    }
    if (filters.onlyAvailable && !p.isAvailable) return false;
    if (typeof filters.minPrice === "number" && p.startingPrice < filters.minPrice) return false;
    if (typeof filters.maxPrice === "number" && p.startingPrice > filters.maxPrice) return false;
    return true;
  });
}

export function sortProducts(products: ProductSummary[], sort: SortOption = "popular") {
  const list = [...products];
  switch (sort) {
    case "newest":
      return list.sort((a, b) => b.addedIndex - a.addedIndex);
    case "price-asc":
      return list.sort((a, b) => a.startingPrice - b.startingPrice);
    case "price-desc":
      return list.sort((a, b) => b.startingPrice - a.startingPrice);
    case "popular":
    default:
      // ⚠️ اصلاح این مرحله: قبلاً از rating×reviewCount ساختگی به‌عنوان
      // Proxy «محبوب‌ترین» استفاده می‌شد (همان داده جعلی که حذف شد). تا
      // اتصال Analytics واقعی (بازدید/فروش واقعی هر محصول)، ترتیب کاتالوگ
      // (بدون ادعای اندازه‌گیری محبوبیت واقعی) صادقانه‌تر از یک عدد ساختگی است.
      return list;
  }
}

export function paginate<T>(items: T[], page: number, pageSize = PAGE_SIZE) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    totalPages,
    currentPage: safePage,
    totalItems: items.length,
  };
}

export function parseShopSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): ShopFilterState {
  const get = (key: string) => {
    const v = searchParams[key];
    return Array.isArray(v) ? v[0] : v;
  };

  const unitParam = get("unit");
  const sortParam = get("sort") as SortOption | undefined;

  return {
    q: get("q") || undefined,
    unit: unitParam ? (unitParam.split(",") as ShopFilterState["unit"]) : undefined,
    onlyAvailable: get("avail") === "1",
    minPrice: get("min") ? Number(get("min")) : undefined,
    maxPrice: get("max") ? Number(get("max")) : undefined,
    minRating: get("rating") ? Number(get("rating")) : undefined,
    sort: sortParam,
    page: get("page") ? Number(get("page")) : 1,
  };
}
