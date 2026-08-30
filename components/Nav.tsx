"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import { logout } from "@/app/account/actions";

// Same items on desktop (as direct buttons) and inside the mobile
// slide-down panel (behind the hamburger).
const links = [
  { href: "/", label: "خانه" },
  { href: "/portfolio", label: "نمونه‌کارها" },
  { href: "/order", label: "ثبت سفارش" },
  { href: "/blog", label: "وبلاگ" },
  { href: "/about", label: "درباره ما" },
  { href: "/contact", label: "تماس با ما" },
];



export default function Nav({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const accountLabel = isLoggedIn ? "حساب کاربری" : "ثبت‌ نام";
  const leaveAccount = isLoggedIn ? <form action={logout} className="flex-shrink-0">
            <button
              type="submit"
              className="rounded-full border-2 border-red-500/60 bg-red-500/[0.06] px-4 py-2.5 text-[13px] font-bold text-red-500 transition hover:bg-red-500 hover:text-white sm:px-5 sm:text-[13.5px]"
            >
              خروج از حساب
            </button>
          </form> : ""

  return (
    <>
      {/* Sticky glass nav — theme-adaptive blurred bar with a hairline
          border, the same treatment Vercel/GitHub use on their marketing
          headers, instead of a fixed brand-color block. */}
      <header className="sticky top-0 z-[100] border-b border-ink/10 bg-canvas/70 backdrop-blur-xl">
        <div className="mx-auto max-w-container px-6">
          {/* Mobile bar: menu + dark mode on the right, wordmark centered,
              signup/account on the left. Plain 3-column grid so each group
              stays put regardless of the other groups' width. */}
          <div className="grid h-[68px] grid-cols-3 items-center md:hidden">
            <div className="flex items-center gap-2">
              <button
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink/[0.14]"
                aria-label="منو"
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen((v) => !v)}
              >
                <span className="relative block h-[2px] w-4 bg-accent before:absolute before:-top-[6px] before:block before:h-[2px] before:w-4 before:bg-ink before:content-[''] after:absolute after:top-[6px] after:block after:h-[2px] after:w-4 after:bg-ink after:content-['']" />
              </button>
              <ThemeToggle />
            </div>

            <a href="#" className="flex items-center justify-center gap-2 font-mono text-[16px] font-black tracking-wide text-ink">
              <span className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg shadow-glow">
                <Image src="/logo.jpg" alt="وب پیکاسو" fill sizes="32px" className="object-cover" priority />
              </span>
            </a>

            <div className="flex justify-end">
              <Link
                href="/account"
                className="whitespace-nowrap rounded-lg bg-ink px-4 py-2 font-mono text-[12.5px] font-bold text-canvas transition hover:opacity-85"
              >
                {accountLabel}
              </Link>
            </div>
            
          </div>

          {/* Desktop bar: logo + the four section buttons on the left,
              signup/account + contact + dark mode on the right. Forced to
              an ltr flow just for this row so "left"/"right" line up with
              how the layout was asked for — the Persian labels inside
              still shape and read correctly. */}
          <div dir="ltr" className="hidden h-[68px] items-center justify-between md:flex">
            <div className="flex items-center gap-8">
              <a href="#" className="flex items-center gap-2.5 font-mono text-[17px] font-black tracking-wide text-ink">
                <span className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg shadow-glow">
                  <Image src="/logo.jpg" alt="وب پیکاسو" fill sizes="36px" className="object-cover" priority />
                </span>
                <span className="leading-none">
                  WebPIKASO
                  <span className="text-accent">.</span>
                </span>
              </a>

              <nav className="flex items-center gap-7">
                {[...links].reverse().map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    className="text-[14px] font-semibold text-dim transition hover:text-ink"
                  >
                    {l.label}
                  </a>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/account"
                className="whitespace-nowrap rounded-lg bg-ink px-5 py-[9px] font-mono text-[13px] font-bold text-canvas transition hover:opacity-85"
              >
                {accountLabel}
              </Link>

              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Rendered as a sibling of <header>, not nested inside it, so the
          fixed mobile panel positions itself against the viewport rather
          than any potential containing-block quirk from the header. */}
      <div
        className={`fixed inset-x-0 top-[68px] bottom-0 z-[95] flex-col gap-6 border-t border-ink/10 bg-canvas/95 px-6 py-8 text-xl font-semibold text-ink backdrop-blur-xl md:hidden ${
          mobileOpen ? "flex" : "hidden"
        }`}
      >
        {links.map((l) => (
          <a key={l.href} href={l.href} onClick={() => setMobileOpen(false)}>
            {l.label}
          </a>
        ))}
        <Link href="/account" onClick={() => setMobileOpen(false)}>
          {accountLabel}
        </Link>

        {leaveAccount}
      </div>
    </>
  );
}
