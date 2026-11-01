"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useShopQuery } from "@/lib/useShopQuery";
import { track } from "@/lib/analytics";

const RECENT_SEARCHES_KEY = "karimoglu:recent-searches";
const POPULAR_SEARCHES = ["باقلوا", "استانبولی", "شیرینی خشک", "دنر کباب"];

/**
 * طبق UX Architecture (بخش ۷ سند سوم/جستجو): Input + Suggestions زنده +
 * Recent Searches + Popular Searches + Empty State. ذخیره «جستجوهای اخیر» در
 * localStorage صرفاً یک بهبود تجربه سمت کلاینت است (نه منبع اصلی داده)؛
 * در آینده با Search Analytics واقعی (طبق الزام Prompt) در Backend جایگزین می‌شود.
 */
export function ShopSearchBar() {
  const { searchParams, setParam } = useShopQuery();
  const [value, setValue] = useState(searchParams.get("q") ?? "");
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) setRecentSearches(JSON.parse(stored));
    } catch {
      // localStorage در دسترس نبود (مثلاً حالت Private Browsing) — بدون شکست ادامه می‌دهیم
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // پیشنهادهای زنده از سرور (کاتالوگ در دیتابیس است، نه در کد مرورگر)
  const [suggestions, setSuggestions] = useState<{ id: string; slug: string; name: string; categoryLabel: string }[]>([]);
  const [totalMatches, setTotalMatches] = useState(0);

  useEffect(() => {
    const term = value.trim();
    if (!term) {
      setSuggestions([]);
      setTotalMatches(0);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetch(`/api/shop/suggest?q=${encodeURIComponent(term)}`, { signal: controller.signal })
        .then((res) => (res.ok ? res.json() : { items: [], total: 0 }))
        .then((data: { items: typeof suggestions; total: number }) => {
          setSuggestions(data.items ?? []);
          setTotalMatches(data.total ?? 0);
        })
        .catch(() => {
          // لغو درخواست قبلی یا خطای شبکه: پیشنهادها همان‌طور که بودند می‌مانند
        });
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function commitSearch(term: string) {
    setValue(term);
    setParam({ q: term || null });
    setIsFocused(false);
    if (term.trim()) {
      const resultCount = term.trim() === value.trim() ? totalMatches : 0;
      track({ name: "search", query: term.trim(), resultCount });
      try {
        const next = [term, ...recentSearches.filter((s) => s !== term)].slice(0, 5);
        setRecentSearches(next);
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
    }
  }

  return (
    <div ref={containerRef} className="relative w-full tablet:max-w-sm">
      <label htmlFor="shop-search" className="sr-only">
        جستجوی محصول
      </label>
      <div className="flex items-center gap-2 rounded-md border border-border-strong bg-surface px-3">
        <span aria-hidden="true" className="text-text-muted">
          🔍
        </span>
        <input
          id="shop-search"
          type="search"
          value={value}
          placeholder="جستجو در محصولات..."
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitSearch(value);
          }}
          className="h-11 w-full bg-transparent text-bodySm text-text-primary focus-visible:outline-none"
        />
      </div>

      {isFocused && (
        <div className="absolute z-dropdown mt-2 w-full rounded-md border border-border bg-surface p-3 shadow-md">
          {value.trim() ? (
            suggestions.length > 0 ? (
              <ul className="flex flex-col gap-1">
                {suggestions.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/product/${p.slug}`}
                      className="block rounded-sm px-2 py-2 text-bodySm text-text-primary hover:bg-bg-secondary"
                    >
                      {p.name}
                      <span className="text-caption text-text-muted"> — {p.categoryLabel}</span>
                    </Link>
                  </li>
                ))}
                <li className="pt-1">
                  <button
                    type="button"
                    onClick={() => commitSearch(value)}
                    className="w-full rounded-sm px-2 py-2 text-right text-bodySm text-brand-red hover:bg-bg-secondary"
                  >
                    مشاهده همه نتایج برای «{value}»
                  </button>
                </li>
              </ul>
            ) : (
              <p className="px-2 py-3 text-bodySm text-text-muted">محصولی با این عنوان یافت نشد.</p>
            )
          ) : (
            <div className="flex flex-col gap-3">
              {recentSearches.length > 0 && (
                <div>
                  <span className="mb-1 block text-label text-text-secondary">جستجوهای اخیر</span>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => commitSearch(term)}
                        className="rounded-full border border-border px-3 py-1 text-caption text-text-secondary hover:border-brand-black"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <span className="mb-1 block text-label text-text-secondary">جستجوهای پرطرفدار</span>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_SEARCHES.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => commitSearch(term)}
                      className="rounded-full bg-bg-secondary px-3 py-1 text-caption text-text-secondary hover:bg-border"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
