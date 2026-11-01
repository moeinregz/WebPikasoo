"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/fx/gsap";

/**
 * نوار متحرک بی‌پایان (Ticker) با GSAP.
 * سرعت و جهتش به سرعت اسکرول کاربر واکنش نشان می‌دهد — هرچه سریع‌تر
 * اسکرول کنید، نوار هم تندتر می‌چرخد و بعد آرام به سرعت عادی برمی‌گردد.
 */
export function Marquee({
  items,
  className = "",
  itemClassName = "",
  separator,
  speed = 60,
  reverse = false,
}: {
  items: string[];
  className?: string;
  itemClassName?: string;
  separator?: React.ReactNode;
  /** پیکسل بر ثانیه */
  speed?: number;
  reverse?: boolean;
}) {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!track.current || prefersReducedMotion()) return;
      const half = track.current.scrollWidth / 2;
      const dir = reverse ? -1 : 1;
      // در RTL محتوا از راست شروع می‌شود؛ حرکت مثبت x یعنی جریان به سمت راست
      const tween = gsap.fromTo(
        track.current,
        { x: dir > 0 ? -half : 0 },
        { x: dir > 0 ? 0 : -half, duration: half / speed, ease: "none", repeat: -1 },
      );

      let reset: gsap.core.Tween | null = null;
      const st = ScrollTrigger.create({
        trigger: root.current,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          const v = gsap.utils.clamp(-4, 4, self.getVelocity() / 400);
          tween.timeScale(1 + Math.abs(v));
          reset?.kill();
          reset = gsap.to(tween, { timeScale: 1, duration: 0.8, ease: "power2.out", delay: 0.05 });
        },
      });
      return () => st.kill();
    },
    { scope: root, dependencies: [items.join("|"), speed, reverse] },
  );

  // ردیف باید از عرض صفحه پهن‌تر باشد تا حلقه بی‌درز دیده شود
  const base = items.length < 12 ? [...items, ...items, ...items].slice(0, Math.max(12, items.length)) : items;
  const row = (keyPrefix: string) =>
    base.map((text, i) => (
      <span key={`${keyPrefix}-${i}`} className={`flex shrink-0 items-center gap-6 px-3 ${itemClassName}`}>
        <span>{text}</span>
        {separator}
      </span>
    ));

  return (
    <div ref={root} className={`overflow-hidden ${className}`} dir="ltr">
      <div ref={track} className="flex w-max will-change-transform" dir="rtl">
        {row("a")}
        {row("b")}
      </div>
    </div>
  );
}
