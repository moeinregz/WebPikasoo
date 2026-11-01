"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/fx/gsap";
import { INTRO_STORAGE_KEY, markIntroDone } from "@/lib/fx/intro";
import { toFaDigits } from "@/lib/fx/digits";

/**
 * ===== انیمیشن لودینگ ورود =====
 * داستان کوتاه «ساخته‌شدن یک برش باقلوا»:
 *   ۱. لایه‌های یوفکا یکی‌یکی کشیده می‌شوند
 *   ۲. رویه پسته از بالا روی برش می‌نشیند و خرده‌پسته‌ها می‌پرند
 *   ۳. یک قطره شهد عسل از بالا می‌چکد
 *   ۴. سه پرده (شکلاتی، عسلی، کرم) پشت‌سرهم بالا می‌روند و سایت ظاهر می‌شود
 *
 * فقط اولین بار در هر Session نمایش داده می‌شود (sessionStorage). با کلیک روی
 * لودینگ سرعتش سه برابر می‌شود. اگر «کاهش حرکت» فعال باشد، فقط یک محو ساده دارد.
 */
const STAGES = ["چیدن لایه‌های یوفکا…", "ریختن مغز پسته…", "شهد عسل و زعفران…", "نوش جان!"];

export function IntroLoader() {
  const root = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState(0);
  const [percent, setPercent] = useState(0);
  const [gone, setGone] = useState(false);

  useGSAP(
    () => {
      const html = document.documentElement;
      const finish = () => {
        html.classList.remove("intro-lock");
        try {
          sessionStorage.setItem(INTRO_STORAGE_KEY, "1");
        } catch {
          /* حالت خصوصی مرورگر — مهم نیست */
        }
        setGone(true);
        markIntroDone();
      };

      // قبلاً در همین Session دیده شده → بلافاصله رد شو
      if (html.classList.contains("intro-seen")) {
        finish();
        return;
      }

      if (prefersReducedMotion()) {
        gsap.to(root.current, { autoAlpha: 0, duration: 0.3, delay: 0.2, onComplete: finish });
        return;
      }

      const q = gsap.utils.selector(root);
      const counter = { v: 0 };
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.set(q(".il-layer path"), { strokeDasharray: 120, strokeDashoffset: 120 })
        .from(q(".il-mark"), { scale: 0.6, autoAlpha: 0, duration: 0.5, ease: "back.out(2)" })
        .from(q(".il-face"), { autoAlpha: 0, y: 20, stagger: 0.12, duration: 0.45 }, "<0.1")
        .to(q(".il-layer path"), { strokeDashoffset: 0, duration: 0.5, stagger: 0.05, ease: "power2.inOut" }, "<0.15")
        .call(() => setStage(1))
        .from(q(".il-top"), { y: -140, autoAlpha: 0, duration: 0.6, ease: "bounce.out" }, "-=0.1")
        .from(
          q(".il-crumb"),
          { scale: 0, transformOrigin: "50% 50%", stagger: { each: 0.04, from: "random" }, duration: 0.35, ease: "back.out(3)" },
          "-=0.2",
        )
        .call(() => setStage(2))
        .fromTo(q(".il-drop"), { y: -220, autoAlpha: 1 }, { y: 0, duration: 0.55, ease: "power2.in" }, "+=0.05")
        .to(q(".il-drop"), { scaleY: 0.4, scaleX: 1.6, autoAlpha: 0, transformOrigin: "50% 100%", duration: 0.25 })
        .from(q(".il-splash"), { scale: 0, transformOrigin: "50% 50%", duration: 0.35, ease: "back.out(3)" }, "<")
        .call(() => setStage(3))
        .from(q(".il-word"), { yPercent: 110, stagger: 0.06, duration: 0.5 }, "-=0.3");

      // شمارنده درصد همگام با کل تایم‌لاین
      tl.to(counter, { v: 100, duration: tl.duration(), ease: "none", onUpdate: () => setPercent(Math.round(counter.v)) }, 0);
      tl.to(q(".il-bar-fill"), { scaleX: 1, duration: tl.duration(), ease: "none" }, 0);

      // خروج: محتوا کوچک و محو، سپس سه پرده پشت‌سرهم بالا می‌روند
      tl.to(q(".il-content"), { scale: 0.9, autoAlpha: 0, duration: 0.45, ease: "power2.in" }, "+=0.25")
        .to(q(".il-panel"), { yPercent: -100, duration: 0.85, stagger: 0.12, ease: "expo.inOut" }, "-=0.1")
        .call(finish, [], "-=0.45");

      const speedUp = () => tl.timeScale(3);
      const el = root.current;
      el?.addEventListener("click", speedUp);
      return () => el?.removeEventListener("click", speedUp);
    },
    { scope: root },
  );

  if (gone) return null;

  return (
    <div ref={root} className="intro-loader fixed inset-0 z-[100] cursor-progress" aria-hidden="true">
      {/* سه پرده: کرم (زیرین) ← عسلی ← شکلاتی (رویی) — ترتیب DOM معکوس ترتیب خروج است */}
      <div className="il-panel absolute inset-0 bg-cream" style={{ zIndex: 1 }} />
      <div className="il-panel absolute inset-0 bg-honey" style={{ zIndex: 2 }} />
      <div className="il-panel matte absolute inset-0 bg-cocoa bg-lattice-dark" style={{ zIndex: 3 }}>
        <div className="il-content flex h-full flex-col items-center justify-center gap-8 px-6 text-center">
          <svg viewBox="0 0 220 230" className="il-mark h-44 w-44 tablet:h-56 tablet:w-56" fill="none">
            {/* قطره و پاشش شهد */}
            <path
              className="il-drop"
              d="M110 6 C115 18 123 26 123 34 A13 13 0 0 1 97 34 C97 26 105 18 110 6Z"
              fill="#DFA03F"
              stroke="#140E0A"
              strokeWidth="3"
              style={{ opacity: 0 }}
            />
            <g className="il-splash">
              <circle cx="92" cy="74" r="5" fill="#DFA03F" stroke="#140E0A" strokeWidth="2" />
              <circle cx="130" cy="70" r="4" fill="#DFA03F" stroke="#140E0A" strokeWidth="2" />
              <circle cx="110" cy="64" r="3.5" fill="#F5E2B8" />
            </g>
            <g transform="translate(10 50)">
              <path d="M12 66 92 101 92 154 12 119Z M92 101 172 66 172 119 92 154Z" fill="#140E0A" transform="translate(-6 8)" />
              <path className="il-face" d="M20 58 100 93 100 146 20 111Z" fill="#C98A2E" stroke="#140E0A" strokeWidth="3.5" strokeLinejoin="round" />
              <path className="il-face" d="M100 93 180 58 180 111 100 146Z" fill="#DFA03F" stroke="#140E0A" strokeWidth="3.5" strokeLinejoin="round" />
              {[12, 20, 28, 36, 44].map((k) => (
                <g key={k} className="il-layer" stroke="#F5D89A" strokeWidth="2.4" strokeLinecap="round">
                  <path d={`M24 ${60 + k} Q42 ${66 + k} 60 ${76 + k} T96 ${93 + k}`} />
                  <path d={`M104 ${93 + k} Q122 ${82 + k} 140 ${76 + k} T176 ${60 + k}`} />
                </g>
              ))}
              <g className="il-top">
                <path d="M100 22 180 58 100 93 20 58Z" fill="#8EA05E" stroke="#140E0A" strokeWidth="3.5" strokeLinejoin="round" />
                {[
                  [78, 52, 6, "#4E6534"],
                  [104, 44, 5, "#B9C88A"],
                  [122, 58, 7, "#4E6534"],
                  [96, 66, 5.5, "#B9C88A"],
                  [62, 60, 4, "#B9C88A"],
                  [140, 54, 4, "#B9C88A"],
                  [112, 74, 3.5, "#4E6534"],
                  [88, 36, 3, "#4E6534"],
                ].map(([cx, cy, r, fill], i) => (
                  <circle key={i} className="il-crumb" cx={cx} cy={cy} r={r} fill={fill as string} />
                ))}
              </g>
            </g>
          </svg>

          <div className="flex flex-col items-center gap-2">
            <p className="flex gap-3 overflow-hidden font-fancy text-[44px] leading-tight text-cream tablet:text-[64px]">
              <span className="il-word inline-block">باقلوا</span>
              <span className="il-word inline-block text-honey">کریم‌اوغلو</span>
            </p>
            <p className="h-6 text-bodySm text-text-inverseMuted" aria-live="off">
              {STAGES[stage]}
            </p>
          </div>

          <div className="flex w-56 flex-col items-center gap-3">
            <div className="h-4 w-full overflow-hidden rounded-full border-2 border-brand-blackDeep bg-cocoa-light shadow-hard-honey">
              <div className="il-bar-fill h-full origin-right scale-x-0 bg-honey" />
            </div>
            <span className="font-fancy text-h3 tabular-nums text-honey">{toFaDigits(percent)}٪</span>
          </div>
        </div>
      </div>
    </div>
  );
}
