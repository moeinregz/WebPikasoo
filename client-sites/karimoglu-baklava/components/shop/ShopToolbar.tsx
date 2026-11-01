import { ShopSearchBar } from "./ShopSearchBar";
import { SortDropdown } from "./SortDropdown";
import { ActiveFilterChips } from "./ActiveFilterChips";

export function ShopToolbar({ resultCount }: { resultCount: number }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-stretch gap-3 tablet:flex-row tablet:items-center tablet:justify-between">
        <ShopSearchBar />
        <div className="flex items-center gap-3">
          <span className="hidden whitespace-nowrap text-bodySm text-text-muted tablet:block">
            {resultCount.toLocaleString("fa-IR")} محصول
          </span>
          <div className="hidden tablet:block">
            <SortDropdown />
          </div>
        </div>
      </div>
      <ActiveFilterChips />
    </div>
  );
}
