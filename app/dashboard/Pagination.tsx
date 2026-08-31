"use client";

import { toPersianDigits } from "@/lib/auth";

/** Builds the sequence of page numbers to show, collapsing long ranges
 *  with a "…" the way most paginated tables do — e.g. for page 7 of 20:
 *  1 … 6 7 8 … 20 — instead of a wall of thirty buttons. */
function buildPageList(current: number, total: number): (number | "gap")[] {
  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);

  const result: (number | "gap")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) result.push("gap");
    result.push(p);
    prev = p;
  }
  return result;
}

export default function Pagination({
  page,
  totalItems,
  pageSize = 20,
  onChange,
}: {
  page: number;
  totalItems: number;
  pageSize?: number;
  onChange: (page: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  if (totalPages <= 1) return null;

  const clamped = Math.min(Math.max(page, 1), totalPages);
  const pageList = buildPageList(clamped, totalPages);

  const btnBase =
    "flex h-8 min-w-[2rem] items-center justify-center rounded-lg px-2 font-mono text-[12.5px] font-bold transition disabled:pointer-events-none disabled:opacity-40";

  return (
    <nav
      aria-label="صفحه‌بندی"
      className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-ink/10 pt-4"
    >
      <p className="font-mono text-[12px] text-dim">
        صفحه‌ی {toPersianDigits(clamped)} از {toPersianDigits(totalPages)} — {toPersianDigits(totalItems)} مورد
      </p>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onChange(clamped - 1)}
          disabled={clamped === 1}
          aria-label="صفحه‌ی قبل"
          className={`${btnBase} border border-ink/[0.16] text-dim hover:border-accent hover:text-accent`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>

        {pageList.map((p, i) =>
          p === "gap" ? (
            <span key={`gap-${i}`} className="px-1 text-dim/60">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onChange(p)}
              aria-current={p === clamped ? "page" : undefined}
              className={`${btnBase} ${
                p === clamped
                  ? "bg-navy text-alabaster"
                  : "border border-ink/[0.16] text-dim hover:border-accent hover:text-accent"
              }`}
            >
              {toPersianDigits(p)}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => onChange(clamped + 1)}
          disabled={clamped === totalPages}
          aria-label="صفحه‌ی بعد"
          className={`${btnBase} border border-ink/[0.16] text-dim hover:border-accent hover:text-accent`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5">
            <path d="M15 6l-6 6 6 6" />
          </svg>
        </button>
      </div>
    </nav>
  );
}
