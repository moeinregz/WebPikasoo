"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * پوسته Sticky هدر: بعد از کمی اسکرول، هدر جمع‌وجورتر می‌شود و سایه سخت
 * می‌گیرد. عمداً از transform روی خود هدر استفاده نشده — Drawerهای fixed
 * داخل هدر (منوی موبایل/سبد خرید) با transform والد، مرجع موقعیتشان به‌هم می‌ریزد.
 */
export function HeaderShell({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      data-scrolled={scrolled}
      className={`group/header sticky top-0 z-sticky border-b-2 border-brand-black bg-cream transition-shadow duration-300 ${
        scrolled ? "shadow-[0_5px_0_0_#DFA03F]" : ""
      }`}
    >
      {children}
    </header>
  );
}
