"use client";

import { useState } from "react";
import Image from "next/image";
import type { ShowcaseSite } from "./BusinessShowcase";

/** The hero's bottom row: three portfolio projects on tilted glass cards,
 *  peeking up from the bottom edge, with the round side arrows paging through
 *  the whole portfolio. */
export default function HeroShowcase({ sites }: { sites: ShowcaseSite[] }) {
  const [start, setStart] = useState(0);
  const n = sites.length;
  if (n === 0) return null;
  const pick = [0, 1, 2].map((k) => sites[(start + k) % n]).slice(0, Math.min(3, n));
  const go = (d: number) => setStart((s) => (s + d + n) % n);

  return (
    <>
      {n > 3 && (
        <>
          <button aria-label="نمونه‌کارهای قبلی" onClick={() => go(-3)} className="ring-arrow absolute -right-2 top-[38%] z-20 hidden lg:grid xl:-right-10">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
          <button aria-label="نمونه‌کارهای بعدی" onClick={() => go(3)} className="ring-arrow absolute -left-2 top-[38%] z-20 hidden lg:grid xl:-left-10">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
        </>
      )}

      <div className="relative z-10 mx-auto grid w-full max-w-[1100px] translate-y-[14%] grid-cols-1 items-end gap-5 px-2 sm:grid-cols-3 sm:gap-7">
        {pick.map((s, i) => {
          const tilt = i === 0 ? "sm:rotate-[5deg] sm:translate-y-6" : i === 2 ? "sm:-rotate-[5deg] sm:translate-y-6" : "";
          return (
            <a
              key={`${s.id}-${start}`}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group block ${i > 0 ? "hidden sm:block" : ""} animate-fade-in-up [animation-fill-mode:both]`}
              style={{ animationDelay: `${i * 90}ms` }}
            >
              <div className={`transition-transform duration-500 ${tilt}`}>
              <span className="mono-label mb-2.5 !text-white/75">
                {`نمونه‌کار ${String(((start + i) % n) + 1).padStart(2, "0")}`} · {s.category}
              </span>
              <div className="peek-card group-hover:-translate-y-2">
                <div className="relative aspect-[16/10] overflow-hidden rounded-[14px] bg-[#07131b]">
                  {s.image ? (
                    <Image src={s.image} alt={s.name} fill sizes="(min-width: 640px) 33vw, 100vw" className="object-cover object-top transition duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="grid h-full place-items-center text-white/30">{s.name}</div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />
                  <span className="absolute bottom-3 right-3 text-[15px] font-bold text-white">{s.name}</span>
                  <span className="absolute bottom-3 left-3 grid h-8 w-8 place-items-center rounded-full bg-white text-[#02070A] opacity-0 transition group-hover:opacity-100">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.2}>
                      <path d="M7 17 17 7M8 7h9v9" />
                    </svg>
                  </span>
                </div>
              </div>
              </div>
            </a>
          );
        })}
      </div>
    </>
  );
}
