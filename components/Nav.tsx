"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import { logout } from "@/app/account/actions";

// Same items on desktop (as direct buttons) and inside the mobile
// full-screen panel (behind the hamburger).
const links = [
  { href: "/", label: "خانه" },
  { href: "/portfolio", label: "نمونه‌کارها" },
  { href: "/order", label: "تعرفه‌ها" },
  { href: "/#lead-form", label: "مشاوره رایگان" },
  { href: "/blog", label: "وبلاگ" },
  { href: "/about", label: "درباره ما" },
  { href: "/contact", label: "تماس با ما" },
];

export default function Nav({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const accountLabel = isLoggedIn ? "حساب کاربری" : "ثبت‌ نام";

  // بعد از کمی اسکرول، نوار تمام‌عرض تبدیل به یه «قرص» شناور شیشه‌ای می‌شه.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // وقتی منوی موبایل بازه، اسکرول صفحه‌ی پشتش قفل می‌شه.
  useEffect(() => {
    document.documentElement.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [mobileOpen]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : !href.includes("#") && pathname.startsWith(href));

  const leaveAccount = isLoggedIn ? (
    <form action={logout} className="flex-shrink-0">
      <button
        type="submit"
        className="rounded-full border-2 border-red-500/60 bg-red-500/[0.06] px-4 py-2.5 text-[13px] font-bold text-red-500 transition hover:bg-red-500 hover:text-white sm:px-5 sm:text-[13.5px]"
      >
        خروج از حساب
      </button>
    </form>
  ) : null;

  const logo = (size: number) => (
    <span
      className="relative flex flex-shrink-0 items-center justify-center overflow-hidden rounded-xl shadow-glow ring-1 ring-accent3/30 transition-transform duration-500 group-hover:rotate-[-8deg] group-hover:scale-110"
      style={{ width: size, height: size }}
    >
      <Image src="/logo.webp" alt="وب پیکاسو" fill sizes={`${size}px`} className="object-cover" priority />
    </span>
  );

  return (
    <>
      <header
        className={`sticky top-0 z-[100] transition-all duration-500 ${
          scrolled ? "px-3 pt-3 sm:px-5" : "px-0 pt-0"
        }`}
      >
        <div
          className={`mx-auto transition-all duration-500 ${
            scrolled
              ? "max-w-[1180px] rounded-2xl border border-ink/10 bg-canvas/70 px-4 shadow-[0_20px_50px_-24px_rgba(0,0,0,0.6)] backdrop-blur-2xl sm:px-6"
              : "max-w-container border-b border-transparent bg-transparent px-6"
          }`}
        >
          {/* Mobile bar: menu + dark mode on the right, logo centered,
              signup/account on the left. */}
          <div className={`grid grid-cols-3 items-center transition-all duration-500 md:hidden ${scrolled ? "h-[60px]" : "h-[72px]"}`}>
            <div className="flex items-center gap-2">
              <button
                className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-ink/[0.14] bg-surface/60"
                aria-label="منو"
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen((v) => !v)}
              >
                <span
                  className={`absolute h-[2px] w-[18px] rounded bg-ink transition-all duration-300 ${
                    mobileOpen ? "rotate-45" : "-translate-y-[6px]"
                  }`}
                />
                <span
                  className={`absolute h-[2px] w-[18px] rounded bg-accent3 transition-all duration-300 ${
                    mobileOpen ? "scale-x-0 opacity-0" : ""
                  }`}
                />
                <span
                  className={`absolute h-[2px] w-[18px] rounded bg-ink transition-all duration-300 ${
                    mobileOpen ? "-rotate-45" : "translate-y-[6px]"
                  }`}
                />
              </button>
              <ThemeToggle />
            </div>

            <Link href="/" className="group flex items-center justify-center" onClick={() => setMobileOpen(false)}>
              {logo(36)}
            </Link>

            <div className="flex justify-end">
              <Link
                href="/account"
                className="whitespace-nowrap rounded-full bg-ink px-4 py-2 font-mono text-[12.5px] font-black text-canvas transition hover:opacity-85"
              >
                {accountLabel}
              </Link>
            </div>
          </div>

          {/* Desktop bar: logo + links on the left, account + theme on the
              right. Forced to an ltr flow just for this row so left/right
              line up as designed — Persian labels still shape correctly. */}
          <div
            dir="ltr"
            className={`hidden items-center justify-between transition-all duration-500 md:flex ${
              scrolled ? "h-[66px]" : "h-[78px]"
            }`}
          >
            <div className="flex items-center gap-9">
              <Link href="/" className="group flex items-center gap-2.5 font-mono text-[18px] font-black tracking-wide text-ink">
                {logo(38)}
                <span className="leading-none">
                  WebPIKASO
                  <span className="text-accent3">.</span>
                </span>
              </Link>

              <nav className="flex items-center gap-7">
                {[...links].reverse().map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    data-active={isActive(l.href)}
                    className={`nav-link text-[14px] font-bold transition-colors hover:text-ink ${
                      isActive(l.href) ? "text-ink" : "text-dim"
                    }`}
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/account" className="btn-primary magnetic !px-5 !py-[9px] !text-[13px]">
                {accountLabel}
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Full-screen mobile menu — rendered as a sibling of <header> so its
          fixed positioning is relative to the viewport. Items slide in one
          after another. */}
      <div
        className={`fixed inset-0 z-[95] flex flex-col overflow-y-auto bg-canvas/95 px-7 pb-10 pt-[100px] backdrop-blur-2xl transition-[opacity,visibility] duration-300 md:hidden ${
          mobileOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <div className="aurora">
          <span className="-right-24 -top-20 h-72 w-72 animate-aurora bg-accent" />
          <span className="-bottom-24 -left-20 h-72 w-72 animate-aurora-slow bg-accent3" />
        </div>
        <nav className="relative z-[1] flex flex-col gap-1">
          {links.map((l, i) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className={`group flex items-center justify-between border-b border-ink/10 py-4 font-display text-[30px] leading-none ${
                mobileOpen ? "animate-menu-item-in" : "opacity-0"
              } ${isActive(l.href) ? "text-gradient" : "text-ink"}`}
              style={{ animationDelay: `${80 + i * 55}ms` }}
            >
              {l.label}
              <span className="font-mono text-[12px] font-bold text-dim">0{i + 1}</span>
            </Link>
          ))}
        </nav>
        <div
          className={`relative z-[1] mt-8 flex flex-wrap items-center gap-3 ${mobileOpen ? "animate-menu-item-in" : "opacity-0"}`}
          style={{ animationDelay: `${80 + links.length * 55}ms` }}
        >
          <Link href="/account" onClick={() => setMobileOpen(false)} className="btn-primary">
            {accountLabel}
          </Link>
          {leaveAccount}
        </div>
      </div>
    </>
  );
}
