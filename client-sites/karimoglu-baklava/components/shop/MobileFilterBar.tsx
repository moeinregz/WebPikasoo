"use client";

import { useEffect, useState } from "react";
import { FilterPanel } from "./FilterPanel";
import { SortDropdown } from "./SortDropdown";

export function MobileFilterBar({ resultCount }: { resultCount: number }) {
  const [isOpen, setIsOpen] = useState(false);

  // جلوگیری از اسکرول پس‌زمینه هنگام باز بودن Drawer
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <div className="tablet:hidden">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-md border border-border-strong text-bodySm text-text-primary"
          aria-haspopup="dialog"
        >
          <span aria-hidden="true">☰</span> فیلتر و مرتب‌سازی
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-modal flex flex-col justify-end" role="dialog" aria-modal="true">
          <button
            type="button"
            aria-label="بستن"
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 z-modalBackdrop bg-brand-black/50"
          />
          <div className="relative z-modal max-h-[85vh] overflow-y-auto rounded-t-xl bg-surface p-6 shadow-floating">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-h4 text-text-primary">فیلتر و مرتب‌سازی</h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="بستن پنل فیلتر"
                className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-bg-secondary"
              >
                ✕
              </button>
            </div>

            <div className="mb-6">
              <span className="mb-2 block text-label text-text-secondary">مرتب‌سازی</span>
              <SortDropdown />
            </div>

            <FilterPanel onApplied={() => setIsOpen(false)} />

            <p className="mt-4 text-center text-caption text-text-muted">
              {resultCount.toLocaleString("fa-IR")} محصول یافت شد
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
