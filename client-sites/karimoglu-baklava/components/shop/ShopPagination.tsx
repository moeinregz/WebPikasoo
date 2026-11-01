import Link from "next/link";

function buildHref(basePath: string, params: URLSearchParams, page: number) {
  const next = new URLSearchParams(params.toString());
  if (page <= 1) {
    next.delete("page");
  } else {
    next.set("page", String(page));
  }
  const qs = next.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

/**
 * تصمیم UX Architecture (بخش ۴ سند دوم): Pagination عددی، نه Infinite Scroll —
 * با ~۱۰۰ محصول، Infinite Scroll مزیت محسوسی ندارد اما به Crawlability موتورهای
 * جستجو و به حفظ موقعیت اسکرول هنگام بازگشت با دکمه Back آسیب می‌زند.
 */
export function ShopPagination({
  basePath,
  currentPage,
  totalPages,
  searchParams,
}: {
  basePath: string;
  currentPage: number;
  totalPages: number;
  searchParams: URLSearchParams;
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav aria-label="صفحه‌بندی محصولات" className="flex items-center justify-center gap-2">
      <Link
        href={buildHref(basePath, searchParams, Math.max(1, currentPage - 1))}
        aria-disabled={currentPage === 1}
        className={`flex h-10 w-10 items-center justify-center rounded-md border border-border-strong text-bodySm ${
          currentPage === 1 ? "pointer-events-none opacity-40" : "hover:border-brand-black"
        }`}
      >
        {/* آیکون جهت طبق قاعده Mirror در RTL (UX Architecture بخش ۱۵): دکمه «قبلی» راست‌ترین، پیکان رو به راست */}
        ›
      </Link>

      <div className="hidden items-center gap-2 tablet:flex">
        {pages.map((page) => (
          <Link
            key={page}
            href={buildHref(basePath, searchParams, page)}
            aria-current={page === currentPage ? "page" : undefined}
            className={`flex h-10 w-10 items-center justify-center rounded-md text-bodySm ${
              page === currentPage
                ? "bg-brand-black text-text-inverse"
                : "border border-border-strong text-text-primary hover:border-brand-black"
            }`}
          >
            {page.toLocaleString("fa-IR")}
          </Link>
        ))}
      </div>

      <span className="text-bodySm text-text-secondary tablet:hidden">
        صفحه {currentPage.toLocaleString("fa-IR")} از {totalPages.toLocaleString("fa-IR")}
      </span>

      <Link
        href={buildHref(basePath, searchParams, Math.min(totalPages, currentPage + 1))}
        aria-disabled={currentPage === totalPages}
        className={`flex h-10 w-10 items-center justify-center rounded-md border border-border-strong text-bodySm ${
          currentPage === totalPages ? "pointer-events-none opacity-40" : "hover:border-brand-black"
        }`}
      >
        ‹
      </Link>
    </nav>
  );
}
