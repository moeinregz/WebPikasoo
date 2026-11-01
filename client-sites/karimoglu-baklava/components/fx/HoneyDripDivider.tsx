"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/fx/gsap";
import { HoneyDripEdge } from "@/components/decor/Baklava";

/**
 * لبه شهدچکان بین دو سکشن: رنگ سکشن بالایی روی سکشن پایینی «می‌چکد».
 * قطره‌ها با اسکرول (scrub) کش می‌آیند.
 */
export function HoneyDripDivider({ color, className = "" }: { color: string; className?: string }) {
  const el = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      // هر قطره به اندازه طول خودش بالا (زیر نوار) می‌رود و با اسکرول پایین می‌چکد
      gsap.fromTo(
        ".honey-drip",
        { y: (_i: number, el: SVGPathElement) => -Number(el.dataset.len ?? 40) + 6 },
        {
          y: 0,
          ease: "none",
          stagger: { each: 0.04, from: "random" },
          scrollTrigger: { trigger: el.current, start: "top 95%", end: "top 35%", scrub: 0.8 },
        },
      );
    },
    { scope: el },
  );

  return (
    <div ref={el} aria-hidden="true" className={`pointer-events-none relative z-[2] -mb-[70px] h-[70px] tablet:-mb-[100px] tablet:h-[100px] ${className}`}>
      <HoneyDripEdge color={color} className="block h-full w-full" />
    </div>
  );
}
