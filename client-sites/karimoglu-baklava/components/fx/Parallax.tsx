"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/fx/gsap";

/**
 * Parallax وابسته به اسکرول با GSAP ScrollTrigger (scrub).
 * speed مثبت = آهسته‌تر از اسکرول (عقب‌تر)، منفی = سریع‌تر (جلوتر).
 */
export function Parallax({
  children,
  speed = 0.2,
  rotate = 0,
  className = "",
}: {
  children: ReactNode;
  speed?: number;
  rotate?: number;
  className?: string;
}) {
  const el = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!el.current || prefersReducedMotion()) return;
    gsap.fromTo(
      el.current,
      { yPercent: -speed * 100, rotate: -rotate },
      {
        yPercent: speed * 100,
        rotate,
        ease: "none",
        scrollTrigger: { trigger: el.current, start: "top bottom", end: "bottom top", scrub: 0.6 },
      },
    );
  }, [speed, rotate]);

  return (
    <div ref={el} className={className}>
      {children}
    </div>
  );
}
