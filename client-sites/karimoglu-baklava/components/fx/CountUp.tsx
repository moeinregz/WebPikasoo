"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/fx/gsap";
import { toFaDigits } from "@/lib/fx/digits";

/** شمارنده عددی که هنگام رسیدن به دید از صفر تا مقدار واقعی می‌شمارد. */
export function CountUp({ to, suffix = "", className = "" }: { to: number; suffix?: string; className?: string }) {
  const el = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const node = el.current;
    if (!node) return;
    const obj = { v: 0 };
    gsap.to(obj, {
      v: to,
      duration: 1.6,
      ease: "power2.out",
      scrollTrigger: { trigger: node, start: "top 90%", once: true },
      onUpdate: () => {
        node.textContent = toFaDigits(Math.round(obj.v)) + suffix;
      },
    });
  }, [to, suffix]);

  // مقدار نهایی در HTML سرور هست (برای SEO و بدون JS)؛ GSAP از صفر بازپخشش می‌کند
  return (
    <span ref={el} className={`tabular-nums ${className}`}>
      {toFaDigits(to) + suffix}
    </span>
  );
}
