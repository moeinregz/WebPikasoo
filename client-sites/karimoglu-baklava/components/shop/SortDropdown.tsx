"use client";

import { useShopQuery } from "@/lib/useShopQuery";
import type { SortOption } from "@/lib/types";

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "popular", label: "محبوب‌ترین" },
  { value: "newest", label: "جدیدترین" },
  { value: "price-asc", label: "ارزان‌ترین" },
  { value: "price-desc", label: "گران‌ترین" },
];

export function SortDropdown() {
  const { searchParams, setParam } = useShopQuery();
  const currentSort = (searchParams.get("sort") as SortOption) || "popular";

  return (
    <select
      value={currentSort}
      onChange={(e) => setParam({ sort: e.target.value })}
      aria-label="مرتب‌سازی محصولات"
      className="h-11 w-full rounded-md border border-border-strong bg-surface px-3 text-bodySm text-text-primary tablet:w-auto"
    >
      {sortOptions.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
