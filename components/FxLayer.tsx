"use client";

import { useEffect, useRef } from "react";

/** لایه‌ی افکت‌های سراسری سایت — یه بار تو layout رندر می‌شه:
 *  - نوار پیشرفت اسکرول گرادیانی بالای صفحه
 *  - هاله‌ی نوری نرمی که دنبال ماوس می‌آد (فقط دسکتاپ)
 *  - موقعیت ماوس رو برای کارت‌های .fx-card ست می‌کنه (نورافکن روی کارت)
 *  - دکمه‌های .magnetic یه کم به سمت ماوس کشیده می‌شن
 *  همه‌ش با یه listener روی document (event delegation) کار می‌کنه، پس
 *  هر کارت/دکمه‌ای که بعداً به صفحه اضافه بشه هم خودکار پوشش داده می‌شه. */
export default function FxLayer() {
  const barRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    let raf = 0;

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        const p = h > 0 ? window.scrollY / h : 0;
        if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
      });
    };

    let lastMagnet: HTMLElement | null = null;
    const onMove = (e: PointerEvent) => {
      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${e.clientX - 250}px, ${e.clientY - 250}px, 0)`;
        glowRef.current.style.opacity = "1";
      }
      const target = e.target as Element | null;
      const card = target?.closest?.(".fx-card") as HTMLElement | null;
      if (card) {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - r.left}px`);
        card.style.setProperty("--my", `${e.clientY - r.top}px`);
      }
      if (reduce) return;
      const magnet = target?.closest?.(".magnetic") as HTMLElement | null;
      if (lastMagnet && lastMagnet !== magnet) {
        lastMagnet.style.setProperty("--tx", "0px");
        lastMagnet.style.setProperty("--ty", "0px");
      }
      if (magnet) {
        const r = magnet.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        magnet.style.setProperty("--tx", `${dx * 0.22}px`);
        magnet.style.setProperty("--ty", `${dy * 0.3}px`);
      }
      lastMagnet = magnet;
    };
    const onLeave = () => {
      if (glowRef.current) glowRef.current.style.opacity = "0";
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    if (finePointer) {
      document.addEventListener("pointermove", onMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
    }
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      document.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <>
      <div
        ref={barRef}
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-[150] h-[3px] origin-right bg-gradient-to-l from-accent3 via-sky-aqua to-accent"
        style={{ transform: "scaleX(0)" }}
      />
      <div
        ref={glowRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-0 hidden h-[500px] w-[500px] rounded-full opacity-0 transition-opacity duration-500 md:block"
        style={{
          background: "radial-gradient(circle, rgba(0,180,216,.10) 0%, transparent 60%)",
        }}
      />
    </>
  );
}
