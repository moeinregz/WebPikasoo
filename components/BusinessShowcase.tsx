"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Reveal from "./Reveal";
import { categories, type BusinessCategory } from "@/lib/businessSites";
import EchoHeading from "@/components/EchoHeading";
import { ImageAutoSlider } from "@/components/ui/image-auto-slider";

export type ShowcaseSite = {
  id: number | string;
  name: string;
  // Admin-added projects can use any label, not just the built-in list —
  // so this stays a plain string here even though the dropdown below only
  // offers the known BusinessCategory values.
  category: string;
  desc: string;
  url: string;
  image: string;
};

// دراپ‌داون دسته‌بندی — یه دکمه‌ی تک به‌جای ردیف دکمه‌های زیاد. با هاور
// (روی دسکتاپ) یا کلیک (روی موبایل/دسکتاپ) لیست تیره‌ی زیرش باز می‌شه؛
// با کلیک بیرون از خودش هم بسته می‌شه.
function CategoryDropdown({
  active,
  onChange,
  countOf,
}: {
  active: BusinessCategory | "همه";
  onChange: (c: BusinessCategory | "همه") => void;
  countOf: (c: BusinessCategory | "همه") => number;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function openNow() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  }

  function closeSoon() {
    // یه تأخیر کوتاه تا وقتی موس از دکمه به سمت لیست حرکت می‌کنه، لیست
    // زودتر از موقع بسته نشه.
    closeTimer.current = setTimeout(() => setOpen(false), 160);
  }

  const allOptions: (BusinessCategory | "همه")[] = ["همه", ...categories];

  return (
    <div
      ref={wrapRef}
      className="relative inline-block"
      onMouseEnter={openNow}
      onMouseLeave={closeSoon}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`inline-flex items-center gap-2.5 rounded-full border px-5 py-3 font-mono text-[13.5px] font-bold transition ${
          open
            ? "border-ink bg-ink text-canvas"
            : "border-ink/15 bg-surface text-ink hover:border-ink/30"
        }`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-[15px] w-[15px]">
          <path d="M4 6h16M7 12h10M10 18h4" />
        </svg>
        دسته‌بندی: <span className="text-accent">{active}</span>
        <span
          className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-[11px] ${
            open ? "bg-canvas/20" : "bg-ink/10"
          }`}
        >
          {countOf(active)}
        </span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.4}
          className={`h-[13px] w-[13px] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {/* پنل مشکی/سفید — همیشه تم تیره، مستقل از حالت روشن/تاریک سایت،
          دقیقاً همون حس ترمینال هیرو. */}
      <div
        className={`absolute right-0 z-30 mt-2.5 w-[270px] origin-top-right overflow-hidden rounded-[14px] border border-white/10 bg-[#101013] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.7)] transition-all duration-150 ${
          open ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-1.5 opacity-0"
        }`}
        onMouseEnter={openNow}
        onMouseLeave={closeSoon}
      >
        <ul className="max-h-[360px] overflow-y-auto py-2">
          {allOptions.map((c) => (
            <li key={c}>
              <button
                type="button"
                onClick={() => {
                  onChange(c);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-right text-[13.5px] font-semibold transition-colors ${
                  active === c ? "bg-white/10 text-white" : "text-white/65 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <span
                    className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${
                      active === c ? "bg-accent" : "bg-white/20"
                    }`}
                  />
                  {c}
                </span>
                <span className="font-mono text-[11px] font-bold text-white/40">{countOf(c)}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function BusinessShowcase({ sites }: { sites: ShowcaseSite[] }) {
  const [activeCategory, setActiveCategory] = useState<BusinessCategory | "همه">("همه");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sites.filter((s) => {
      const matchesCategory = activeCategory === "همه" || s.category === activeCategory;
      const matchesQuery =
        !q || s.name.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q) || s.category.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, query, sites]);

  const countOf = (cat: BusinessCategory | "همه") =>
    cat === "همه" ? sites.length : sites.filter((s) => s.category === cat).length;

  return (
    <section id="showcase" className="relative scroll-mt-[90px] overflow-hidden border-t border-ink/10 py-[110px]">

      <div className="relative z-[1] mx-auto max-w-container px-6">
        <Reveal className="mb-10">
          <div>
            <EchoHeading en="Work Like Yours" className="font-display text-[32px] font-normal leading-[1.3] sm:text-[40px] lg:text-[50px]">
              نمونه‌کارهایی شبیه کسب‌وکار شما
            </EchoHeading>
            <p className="mt-2.5 max-w-[62ch] text-[15px] text-dim">
              نمونه‌سایت‌هایی که برای انواع کسب‌وکارها ساخته شده — از دسته‌بندی‌ها انتخاب کن یا
              دنبال چیزی مشخص بگرد تا ببینی برای کسب‌وکار خودت چه سایتی مناسبه.
            </p>
          </div>
        </Reveal>

        {/* z-40 + position اینجا لازمه: Reveal با transform یه stacking context
            جدید می‌سازه، و بدون z-index صریح روی خودِ این Reveal، پنل دراپ‌داون
            هرچقدرم z-30 داشته باشه بازم زیر کارت‌های گالری (که خودشون هم Reveal
            و درنتیجه stacking context هستن و بعداً تو DOM میان) گم می‌شد. */}
        <Reveal className="relative z-40">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CategoryDropdown active={activeCategory} onChange={setActiveCategory} countOf={countOf} />

            <div className="relative w-full sm:w-[300px]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="pointer-events-none absolute right-3.5 top-1/2 h-[16px] w-[16px] -translate-y-1/2 text-dim"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="جستجو بین نمونه‌سایت‌ها…"
                className="w-full rounded-full border border-ink/10 bg-surface py-2.5 pl-4 pr-10 text-[13.5px] font-semibold text-ink outline-none transition placeholder:text-dim focus:border-accent"
              />
            </div>
          </div>
        </Reveal>

        {filtered.length > 0 ? (
          <Reveal>
            {/* full-bleed: the strip spans the whole viewport width */}
            <div className="mx-[calc(50%-50vw)] w-screen">
              <ImageAutoSlider
                key={`${activeCategory}|${query}`}
                items={filtered.map((s) => ({ image: s.image, title: s.name, badge: s.category, href: s.url }))}
              />
            </div>
            <p className="mt-2 text-center text-[12.5px] text-dim">روی هر نمونه بزن تا سایتش باز بشه.</p>
          </Reveal>
        ) : (
          <Reveal className="flex flex-col items-center gap-3 rounded-card border-2 border-dashed border-ink/15 py-16 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-on-accent">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-6 w-6">
                <rect x="3" y="4" width="18" height="14" rx="2" />
                <path d="M3 15l4.5-4.5a2 2 0 0 1 2.8 0L15 15" />
                <circle cx="16" cy="8" r="1.6" />
              </svg>
            </span>
            <p className="max-w-[42ch] text-[14.5px] text-dim">
              {sites.length === 0
                ? "این بخش به‌زودی پر می‌شه — نمونه‌سایت‌های هر نوع کسب‌وکار به‌مرور اینجا اضافه می‌شن."
                : "نمونه‌ای با این مشخصات پیدا نشد — دسته‌بندی یا عبارت جستجو رو تغییر بده."}
            </p>
          </Reveal>
        )}
      </div>
    </section>
  );
}
