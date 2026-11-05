"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import { logout } from "@/app/account/actions";

// Same items on desktop (as direct buttons) and inside the mobile
// slide-down panel (behind the hamburger).
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
      <header className="sticky top-0 z-[100] border-b-2 border-ink bg-canvas">
        <div data-hero-item className="mx-auto max-w-container px-6">
          {/* Mobile bar: menu + dark mode on the right, wordmark centered,
              signup/account on the left. Plain 3-column grid so each group
              stays put regardless of the other groups' width. */}
          <div className="grid h-[68px] grid-cols-3 items-center md:hidden">
            <div className="flex items-center gap-2">
              <button
                className="matte-btn flex h-9 w-9 items-center justify-center rounded-lg bg-surface"
                aria-label="منو"
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen((v) => !v)}
              >
                <span className="relative block h-[2px] w-4 bg-accent before:absolute before:-top-[6px] before:block before:h-[2px] before:w-4 before:bg-ink before:content-[''] after:absolute after:top-[6px] after:block after:h-[2px] after:w-4 after:bg-ink after:content-['']" />
              </button>
              <ThemeToggle />
            </div>

            <Link href="/" className="flex items-center justify-center gap-2 font-mono text-[16px] font-black tracking-wide text-ink">
              <span className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 border-ink transition-transform duration-500 hover:rotate-[-10deg] hover:scale-110">
                <Image src="/logo.webp" alt="وب پیکاسو" fill sizes="32px" className="object-cover" priority />
              </span>
            </Link>

            <div className="flex justify-end">
              <Link
                href="/account"
                className="matte-btn whitespace-nowrap rounded-lg bg-accent px-4 py-2 font-mono text-[12.5px] font-black text-white"
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
              <Link href="/" className="flex items-center gap-2.5 font-mono text-[17px] font-black tracking-wide text-ink">
                <span className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 border-ink transition-transform duration-500 hover:rotate-[-10deg] hover:scale-110">
                  <Image src="/logo.webp" alt="وب پیکاسو" fill sizes="36px" className="object-cover" priority />
                </span>
                <span className="leading-none">
                  WebPIKASO
                  <span className="text-accent">.</span>
                </span>
              </Link>

              <nav className="flex items-center gap-7">
                {[...links].reverse().map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="group relative text-[14px] font-bold text-dim transition hover:text-ink"
                  >
                    {l.label}
                    <span className="absolute -bottom-1.5 left-0 h-[3px] w-full origin-right scale-x-0 rounded-full bg-accent transition-transform duration-300 group-hover:origin-left group-hover:scale-x-100" />
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/account"
                className="matte-btn whitespace-nowrap rounded-lg bg-accent px-5 py-[9px] font-mono text-[13px] font-black text-white"
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
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ clipPath: "circle(0% at 92% 0%)" }}
            animate={{ clipPath: "circle(150% at 92% 0%)" }}
            exit={{ clipPath: "circle(0% at 92% 0%)" }}
            transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-x-0 top-[68px] bottom-0 z-[95] flex flex-col gap-2 overflow-y-auto bg-canvas px-6 py-8 md:hidden"
          >
            {[...links, { href: "/account", label: accountLabel }].map((l, i) => (
              <motion.div
                key={l.href}
                initial={{ opacity: 0, x: -50, rotate: -4 }}
                animate={{ opacity: 1, x: 0, rotate: 0 }}
                transition={{ type: "spring", stiffness: 220, damping: 20, delay: 0.15 + i * 0.05 }}
              >
                <Link
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="matte matte-sm flex items-center justify-between rounded-xl px-5 py-3.5 font-display text-[24px] leading-none text-ink active:translate-x-[-4px] active:translate-y-[4px] active:shadow-none"
                >
                  {l.label}
                  <span className="font-mono text-[12px] font-black text-accent">0{i + 1}</span>
                </Link>
              </motion.div>
            ))}
            <div className="mt-3">{leaveAccount}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
