"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { categoryShowcase } from "@/lib/mock-data";
import { MenuIcon, CloseIcon, UserIcon } from "@/components/ui/icons";

/**
 * ===== منوی موبایل واقعی (اصلاح بخش ۲ Prompt) =====
 *
 * Root Cause قبلی: در Header اصلاً هیچ دکمه/کامپوننت منوی موبایل وجود
 * نداشت — فقط یک کامنت به یک کامپوننت به‌نام «MobileBottomNav» اشاره
 * می‌کرد که هرگز ساخته نشده بود. یعنی در موبایل واقعاً هیچ راهی برای
 * دسترسی به Navigation اصلی/Account وجود نداشت — دقیقاً همان چیزی که
 * گزارش شده بود.
 *
 * این کامپوننت یک Drawer کاملاً Functional است:
 * - باز/بسته شدن واقعی (State، نه صرفاً CSS hover)
 * - Overlay که با کلیک بسته می‌شود
 * - قفل Scroll بدنه صفحه وقتی باز است
 * - بسته‌شدن با کلید Escape
 * - انتقال Focus به داخل Panel هنگام باز شدن (اولین لینک) و بازگشت به دکمه
 *   Trigger هنگام بسته شدن (بدون نیاز به کتابخانه Focus-trap کامل)
 * - بسته‌شدن خودکار بعد از Navigation (تغییر Route)
 * - z-index از token اختصاصی `drawer` (که در Design System تعریف شده بود
 *   ولی تا امروز هیچ‌جا استفاده نمی‌شد)
 */
export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // بستن خودکار بعد از هر تغییر مسیر — دقیقاً الزام صریح Prompt
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden"; // قفل Scroll بدنه

    const firstLink = panelRef.current?.querySelector<HTMLElement>("a, button");
    firstLink?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      triggerRef.current?.focus();
    };
  }, [isOpen]);

  const links: Array<{ href: string; label: string }> = [
    { href: "/shop", label: "فروشگاه" },
    ...categoryShowcase.map((c) => ({ href: `/shop/${c.id}`, label: c.label })),
    { href: "/branches", label: "شعب" },
    { href: "/menu", label: "منو" },
    { href: "/cafe", label: "کافه" },
    { href: "/faq", label: "سوالات متداول" },
    { href: "/contact", label: "تماس با ما" },
  ];

  // Drawer با Portal مستقیم داخل body رندر می‌شود تا هیچ transform/stacking
  // والد (هدر Sticky) روی موقعیت fixed آن اثر نگذارد.
  const drawer = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-drawer desktop:hidden">
          <motion.button
            type="button"
            aria-label="بستن منو"
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-brand-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="matte relative z-10 flex h-full w-[86%] max-w-sm flex-col overflow-y-auto border-l-2 border-brand-black bg-cream bg-lattice p-5 shadow-[-8px_0_0_0_#DFA03F]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 id={titleId} className="font-fancy text-[30px] text-text-primary">
                منو
              </h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="بستن منو"
                className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-brand-black bg-surface shadow-hard-xs"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <motion.nav
              aria-label="ناوبری موبایل"
              className="flex flex-1 flex-col gap-1"
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04, delayChildren: 0.12 } } }}
            >
              {links.map((l) => (
                <motion.div
                  key={l.href}
                  variants={{ hidden: { opacity: 0, x: 40 }, show: { opacity: 1, x: 0 } }}
                >
                  <Link href={l.href} className={LINK_CLASS}>
                    {l.label}
                    <span aria-hidden="true" className="text-honey-deep">◆</span>
                  </Link>
                </motion.div>
              ))}

              <div className="my-3 border-t-2 border-dashed border-border-strong" />

              <motion.div variants={{ hidden: { opacity: 0, x: 40 }, show: { opacity: 1, x: 0 } }}>
                <Link href="/account" className={`${LINK_CLASS} justify-start gap-3 bg-surface !border-brand-black shadow-hard-xs`}>
                  <UserIcon className="h-5 w-5" />
                  حساب کاربری
                </Link>
              </motion.div>
            </motion.nav>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="باز کردن منو"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-brand-black bg-surface text-text-primary shadow-hard-xs desktop:hidden"
      >
        <MenuIcon className="h-6 w-6" />
      </button>
      {mounted && createPortal(drawer, document.body)}
    </>
  );
}

const LINK_CLASS =
  "flex items-center justify-between rounded-lg border-2 border-transparent px-3 py-3 text-body font-medium text-text-primary transition-all hover:border-brand-black hover:bg-honey hover:shadow-hard-xs";
