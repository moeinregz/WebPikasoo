"use client";

import { useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/fx/gsap";
import { BaklavaDiamond } from "@/components/decor/Baklava";

/**
 * ===== انیمیشن ورود به هر صفحه (Page Transition) =====
 * template.tsx برخلاف layout با هر تغییر مسیر دوباره Mount می‌شود.
 * در اولین بارگذاری سایت (که لودینگ ورود نمایش داده می‌شود) پرده اجرا نمی‌شود؛
 * در ناوبری‌های بعدی یک پرده عسلی با نقش لوزی باقلوا از روی صفحه جدید کنار
 * می‌رود و محتوا کمی از پایین بالا می‌آید.
 */
let isFirstMount = true;

export default function Template({ children }: { children: ReactNode }) {
  const content = useRef<HTMLDivElement>(null);
  const curtain = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useGSAP(() => {
    if (isFirstMount) {
      isFirstMount = false;
      return;
    }
    if (prefersReducedMotion()) return;

    const isAdmin = pathname?.startsWith("/admin");
    const tl = gsap.timeline();
    if (!isAdmin) {
      tl.set(curtain.current, { display: "flex", yPercent: 0 })
        .from(curtain.current?.querySelector(".pt-mark") ?? [], { rotate: -90, scale: 0.4, duration: 0.35, ease: "back.out(2)" })
        .to(curtain.current, { yPercent: -100, duration: 0.7, ease: "expo.inOut" }, "+=0.05")
        .set(curtain.current, { display: "none" });
    }
    tl.from(
      content.current,
      { y: 36, autoAlpha: 0, duration: 0.7, ease: "power3.out", clearProps: "all" },
      isAdmin ? 0 : 0.45,
    );
  });

  return (
    <>
      <div
        ref={curtain}
        aria-hidden="true"
        className="matte fixed inset-0 z-[90] hidden items-center justify-center bg-honey bg-lattice-honey"
      >
        <BaklavaDiamond className="pt-mark h-24 w-24" />
      </div>
      <div ref={content}>{children}</div>
    </>
  );
}
