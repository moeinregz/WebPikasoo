import type { ReactNode } from "react";

type Orb = { size: number; top?: string; bottom?: string; left?: string; right?: string; delay?: number };

/** A section on a rounded lavender-cloud panel (same sky as the hero). Inside,
 *  the theme colors flip to light (see .theme-sky), so any section component
 *  renders with black text without changes. Glossy black orbs float as decor. */
export default function SkyIsland({ id, children, orbs = [] }: { id: string; children: ReactNode; orbs?: Orb[] }) {
  return (
    <div className="theme-sky relative isolate mx-2.5 my-6 overflow-hidden rounded-[30px] sm:mx-5 sm:rounded-[44px]">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="sky-island__bg absolute inset-0" />
        <svg className="absolute inset-0 h-full w-full opacity-70 [mix-blend-mode:screen]" preserveAspectRatio="none">
          <filter id={`isl-${id}`} x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.004 0.008" numOctaves="5" seed={id.length * 7} />
            <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 -1.7 1.1" />
          </filter>
          <rect width="100%" height="100%" filter={`url(#isl-${id})`} />
        </svg>
        {orbs.map((o, i) => (
          <span
            key={i}
            className="gloss-orb hidden md:block"
            style={{ width: o.size, height: o.size, top: o.top, bottom: o.bottom, left: o.left, right: o.right, animationDelay: `${o.delay ?? i * 1.3}s` }}
          />
        ))}
      </div>
      {children}
    </div>
  );
}
