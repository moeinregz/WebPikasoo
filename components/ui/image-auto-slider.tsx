"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

// Infinite image strip from the "image-auto-slider" block (21st.dev): the
// list is rendered twice and a CSS animation slides the track by -50%, so
// it loops seamlessly; the edges fade out with a mask. Changes: items come
// from props (each card links to its project and carries a small caption),
// the cards are landscape (14:9, like the project screenshots) so nothing
// is cropped at the sides, the speed follows the number of items, the strip
// pauses on hover / focus, short lists are repeated so the strip is always
// full, and with reduced motion it becomes a plain horizontal scroller.
// To stay light on phones the strip shows at most MAX cards per loop and
// only animates while it is on screen.
// No global style overrides (the block reset html/body).

export type AutoSlide = { image: string; title: string; badge?: string; href?: string };

const MAX = 12;

export function ImageAutoSlider({ items, className }: { items: AutoSlide[]; className?: string }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [run, setRun] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setRun(e.isIntersecting), { rootMargin: "120px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (items.length === 0) return null;
  // 8 to MAX cards per half: enough that the loop never shows a gap on wide
  // screens, few enough that the moving strip stays cheap
  const base: AutoSlide[] = items.slice(0, MAX);
  while (base.length < 8) base.push(...items.slice(0, MAX));
  const track = [...base, ...base];
  const seconds = Math.max(24, base.length * 4.5);

  return (
    <div ref={ref} data-run={run} className={cn("auto-slider w-full overflow-hidden py-4", className)} dir="ltr">
      <div className="auto-slider-track flex w-max gap-4 sm:gap-6" style={{ animationDuration: `${seconds}s` }}>
        {track.map((it, i) => {
          const first = i < base.length;
          const card = (
            <>
              {it.image ? (
                <Image
                  src={it.image}
                  alt={first ? it.title : ""}
                  fill
                  sizes="(min-width: 1024px) 352px, (min-width: 640px) 320px, 256px"
                  className="object-cover object-top"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-surface font-display text-4xl text-dim">{it.title.slice(0, 1)}</div>
              )}
              <div dir="rtl" className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 pb-2.5 pt-8 text-right">
                <span className="truncate text-[13.5px] font-bold text-white">{it.title}</span>
                {it.badge && <span className="flex-shrink-0 rounded-full bg-white/90 px-2 py-0.5 text-[10.5px] font-bold text-black">{it.badge}</span>}
              </div>
            </>
          );
          const cls =
            "auto-slider-item relative block aspect-[14/9] w-64 flex-shrink-0 overflow-hidden rounded-xl border border-white/10 bg-[#101013] shadow-2xl shadow-black/40 sm:w-80 lg:w-[22rem]";
          return it.href ? (
            <a
              key={i}
              href={it.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cls}
              aria-hidden={first ? undefined : true}
              tabIndex={first ? undefined : -1}
              aria-label={first ? `مشاهده‌ی ${it.title}` : undefined}
            >
              {card}
            </a>
          ) : (
            <div key={i} className={cls} aria-hidden={first ? undefined : true}>
              {card}
            </div>
          );
        })}
      </div>
    </div>
  );
}
