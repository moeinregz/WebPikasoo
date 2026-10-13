import Link from "next/link";

function buildHref(basePath: string, params: Record<string, string | undefined>, page: number) {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) qs.set(key, value);
  }
  if (page > 1) qs.set("page", String(page));
  const s = qs.toString();
  return s ? `${basePath}?${s}` : basePath;
}

/** شماره صفحه‌ها با «…» برای لیست‌های طولانی: ۱ … ۴ ۵ [۶] ۷ ۸ … ۲۰ */
function pageWindow(current: number, total: number): (number | "gap")[] {
  const set = new Set<number>([1, total, current, current - 1, current + 1, current - 2, current + 2]);
  const sorted = [...set].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const result: (number | "gap")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) result.push("gap");
    result.push(p);
  });
  return result;
}

export function AdminPagination({
  basePath,
  currentPage,
  totalPages,
  total,
  pageSize,
  params,
}: {
  basePath: string;
  currentPage: number;
  totalPages: number;
  total: number;
  pageSize: number;
  params: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, total);
  const box = "flex h-9 min-w-9 items-center justify-center rounded-md px-2 text-bodySm";
  const fa = (n: number) => n.toLocaleString("fa-IR");

  return (
    <nav aria-label="صفحه‌بندی" className="flex flex-col items-center gap-3 tablet:flex-row tablet:justify-between">
      <p className="text-caption text-text-muted">
        نمایش {fa(from)} تا {fa(to)} از {fa(total)} محصول
      </p>
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        <Link
          href={buildHref(basePath, params, Math.max(1, currentPage - 1))}
          aria-disabled={currentPage === 1}
          className={`${box} border border-border-strong ${currentPage === 1 ? "pointer-events-none opacity-40" : "hover:border-brand-black"}`}
        >
          قبلی
        </Link>
        {pageWindow(currentPage, totalPages).map((p, i) =>
          p === "gap" ? (
            <span key={`gap-${i}`} className="px-1 text-text-muted">
              …
            </span>
          ) : (
            <Link
              key={p}
              href={buildHref(basePath, params, p)}
              aria-current={p === currentPage ? "page" : undefined}
              className={`${box} ${
                p === currentPage ? "bg-brand-black text-white" : "border border-border-strong text-text-primary hover:border-brand-black"
              }`}
            >
              {fa(p)}
            </Link>
          ),
        )}
        <Link
          href={buildHref(basePath, params, Math.min(totalPages, currentPage + 1))}
          aria-disabled={currentPage === totalPages}
          className={`${box} border border-border-strong ${currentPage === totalPages ? "pointer-events-none opacity-40" : "hover:border-brand-black"}`}
        >
          بعدی
        </Link>
      </div>
    </nav>
  );
}
