"use client";

import { useEffect, useState, type ReactNode } from "react";
import { logout } from "./actions";

export type DashboardTab = {
  id: string;
  label: string;
  panel: ReactNode;
};

export default function DashboardTabs({ tabs }: { tabs: DashboardTab[] }) {
  const [tab, setTab] = useState<string>(tabs[0]?.id ?? "");
  const [open, setOpen] = useState(false);
  const active = tabs.find((t) => t.id === tab) ?? tabs[0];

  // If the viewport grows into the desktop breakpoint while the mobile
  // drawer happens to be open, close it so it doesn't linger behind the
  // now-permanent desktop sidebar.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const handler = () => {
      if (mq.matches) setOpen(false);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Lock background scroll while the mobile drawer is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  function selectTab(id: string) {
    setTab(id);
    setOpen(false);
  }

  return (
    <div className="lg:flex lg:items-start lg:gap-8">
      {/* Mobile control bar — hamburger toggle + current section name,
          sticky so it's reachable without scrolling back up. Hidden on
          desktop where the sidebar is always visible instead. */}
      <div className="sticky top-[68px] z-30 mb-6 flex items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-canvas/90 px-4 py-3 backdrop-blur-xl lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="باز کردن منو"
          aria-expanded={open}
          className="flex flex-shrink-0 items-center gap-2 rounded-xl border border-ink/[0.16] px-4 py-2.5 text-[14px] font-bold text-ink transition active:scale-[0.97]"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-[18px] w-[18px] flex-shrink-0">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          منو
        </button>
        <span className="truncate text-[14.5px] font-bold text-dim">{active?.label}</span>
      </div>

      {/* Backdrop behind the mobile drawer */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/55 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar — a right-anchored slide-in drawer on mobile/tablet, and
          a permanently open right-hand column on desktop (matching the
          page's RTL reading direction, so "right side" is the natural
          start side there too). */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-[80%] max-w-[300px] flex-col gap-1.5 overflow-y-auto border-l border-ink/10 bg-canvas px-4 pb-8 pt-[86px] shadow-2xl transition-transform duration-300 ease-out
          lg:inset-y-auto lg:right-auto lg:sticky lg:top-[92px] lg:z-auto lg:h-[calc(100vh-116px)] lg:w-[248px] lg:flex-shrink-0 lg:translate-x-0
          lg:border-l-0 lg:bg-transparent lg:px-0 lg:pt-0 lg:pb-0 lg:shadow-none lg:transition-none
          ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="mb-3 flex items-center justify-between lg:hidden">
          <span className="font-mono text-[12.5px] font-bold text-dim">بخش‌های داشبورد</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="بستن منو"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-ink/[0.16] text-dim transition hover:text-ink"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => selectTab(t.id)}
            className={`w-full flex-shrink-0 rounded-xl px-4 py-3.5 text-right text-[14.5px] font-bold transition lg:py-3 ${
              tab === t.id
                ? "bg-navy text-alabaster shadow-glow-soft"
                : "text-dim hover:bg-ink/[0.06] hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}

        {/* Sits at the bottom of the same menu, separated from the section
            buttons by a hairline, so it's reachable from wherever the
            drawer/sidebar already is instead of only living up in the
            page header. */}
        <div className="mt-3 flex-shrink-0 border-t border-ink/10 pt-3">
          <form action={logout}>
            <button
              type="submit"
              className="flex w-full items-center justify-between gap-2 rounded-xl px-4 py-3.5 text-right text-[14.5px] font-bold text-red-500/90 transition hover:bg-red-500/10 lg:py-3"
            >
              خروج از حساب
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4 flex-shrink-0">
                <path d="M15 17l5-5-5-5M20 12H9M12 19H6a2 2 0 01-2-2V7a2 2 0 012-2h6" />
              </svg>
            </button>
          </form>
        </div>
      </aside>

      {/* Content — now that the tab buttons no longer sit in a wrapping
          horizontal row, this gets the freed-up width plus a slightly
          larger, more readable type scale. */}
      <div className="min-w-0 flex-1 text-[15px] leading-relaxed lg:text-[15.5px]">{active?.panel}</div>
    </div>
  );
}
