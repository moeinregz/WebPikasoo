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
        <span className="sky-aurora left-[-8%] top-[10%] h-[60%] w-[40%] bg-[#ff8ad8] !opacity-30" />
        <span className="sky-aurora right-[-8%] bottom-[0%] h-[60%] w-[40%] bg-[#7fe3ff] !opacity-30 [animation-delay:-8s]" />
        <div className="sky-cloud left-[-6%] top-[-4%] h-[26%] w-[40%] opacity-80">
          <span style={{ left: "0%", top: "30%", width: "30%", aspectRatio: "1" }} />
          <span style={{ left: "18%", top: "8%", width: "36%", aspectRatio: "1" }} />
          <span style={{ left: "44%", top: "26%", width: "30%", aspectRatio: "1" }} />
        </div>
        <div className="sky-cloud right-[-6%] bottom-[-6%] h-[26%] w-[44%] opacity-70 [animation-delay:-14s]">
          <span style={{ left: "4%", top: "30%", width: "30%", aspectRatio: "1" }} />
          <span style={{ left: "26%", top: "10%", width: "36%", aspectRatio: "1" }} />
          <span style={{ left: "54%", top: "28%", width: "30%", aspectRatio: "1" }} />
        </div>
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
