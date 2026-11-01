import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function ShopEmptyState({
  hasActiveFilters,
  clearFiltersHref,
}: {
  hasActiveFilters: boolean;
  clearFiltersHref: string;
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-lg bg-surface py-16 text-center shadow-sm">
      <span aria-hidden="true" className="text-h1">
        🔍
      </span>
      <h2 className="text-h4 text-text-primary">
        {hasActiveFilters ? "محصولی با این فیلتر یافت نشد" : "محصولی یافت نشد"}
      </h2>
      <p className="max-w-[40ch] text-bodySm text-text-secondary">
        {hasActiveFilters
          ? "می‌توانید فیلترها را پاک کنید یا دسته‌بندی دیگری را امتحان کنید."
          : "لطفاً دوباره تلاش کنید یا دسته‌بندی دیگری را مشاهده کنید."}
      </p>
      {hasActiveFilters && (
        <Link href={clearFiltersHref}>
          <Button variant="secondary">پاک کردن فیلترها</Button>
        </Link>
      )}
    </div>
  );
}
