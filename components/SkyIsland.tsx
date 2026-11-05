import type { ReactNode } from "react";

/** A section set on a rounded midnight "beam" panel: the hero's light curtain
 *  in miniature — fine vertical lines lit electric blue from above, a
 *  cantaloupe ember glowing at the bottom. (Kept the old name so page.tsx
 *  stays simple.) */
export default function SkyIsland({ id, children }: { id: string; children: ReactNode }) {
  return (
    <div data-panel={id} className="beam-panel relative isolate mx-2.5 my-6 overflow-hidden rounded-[30px] sm:mx-5 sm:rounded-[40px]">
      <div aria-hidden className="beam-panel__lines pointer-events-none absolute inset-0 -z-10" />
      <div aria-hidden className="pointer-events-none absolute inset-x-[20%] top-0 -z-10 h-px bg-gradient-to-r from-transparent via-[#5cc4ff] to-transparent opacity-70" />
      {children}
    </div>
  );
}
