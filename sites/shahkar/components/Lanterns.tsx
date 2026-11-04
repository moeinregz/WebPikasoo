"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { LanternSvg } from "./Ornaments";

// Like the real garden: a string of lanterns across the front, mostly amber with a few coloured glasses.
const LAMPS = [
  { x: 6, drop: 34, hue: "amber" },
  { x: 19, drop: 52, hue: "sapphire" },
  { x: 32, drop: 40, hue: "amber" },
  { x: 45, drop: 60, hue: "emerald" },
  { x: 58, drop: 44, hue: "amber" },
  { x: 71, drop: 56, hue: "ruby" },
  { x: 84, drop: 38, hue: "amber" },
  { x: 95, drop: 50, hue: "amber" },
] as const;

export default function Lanterns() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const lamps = gsap.utils.toArray<HTMLElement>(".lamp");
      lamps.forEach((el, i) => {
        gsap.fromTo(
          el,
          { rotation: -4 - (i % 3) },
          {
            rotation: 4 + (i % 3),
            duration: 2.4 + (i % 4) * 0.45,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            delay: i * -0.37,
          },
        );
      });
      // Pointer "breeze": lanterns lean away from the cursor movement.
      const lean = lamps.map((el) => gsap.quickTo(el.querySelector(".lamp-body"), "rotation", { duration: 1.2, ease: "power3.out" }));
      let lastX = 0;
      const onMove = (e: PointerEvent) => {
        const v = gsap.utils.clamp(-14, 14, (e.clientX - lastX) * 0.6);
        lastX = e.clientX;
        lean.forEach((q, i) => q(v * (0.6 + (i % 3) * 0.2)));
        gsap.delayedCall(0.15, () => lean.forEach((q) => q(0)));
      };
      window.addEventListener("pointermove", onMove);
      return () => window.removeEventListener("pointermove", onMove);
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <div className="lanterns" ref={root} aria-hidden="true">
      <svg className="lantern-string" viewBox="0 0 100 20" preserveAspectRatio="none">
        <path d="M0 2 Q 25 14 50 8 T 100 4" fill="none" stroke="rgba(217,180,90,.55)" strokeWidth=".25" vectorEffect="non-scaling-stroke" />
      </svg>
      {LAMPS.map((l, i) => (
        <div
          key={i}
          className={`lamp lamp-${l.hue}`}
          style={{ left: `${l.x}%`, ["--drop" as string]: `${l.drop}px` }}
        >
          <span className="lamp-cord" />
          <div className="lamp-body">
            <span className="lamp-halo" />
            <LanternSvg hue={l.hue} />
          </div>
        </div>
      ))}
    </div>
  );
}
