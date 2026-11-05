"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

// همون تکه‌های هندسیِ لوگوی کوبیستی (مثل PageLoader) — این‌جا با GSAP از
// بیرون پرواز می‌کنن و یه «چهره» می‌سازن.
const pieces = [
  { points: "90,90 168,90 149.7,140.2", color: "#AD96F1" },
  { points: "90,90 149.7,140.2 96.8,167.7", color: "#C4B3F6" },
  { points: "90,90 96.8,167.7 63.3,163.3", color: "#9479EC" },
  { points: "90,90 63.3,163.3 16.7,116.7", color: "#C4B3F6" },
  { points: "90,90 16.7,116.7 22.5,51", color: "#7C5CE6" },
  { points: "90,90 22.5,51 76.4,13.2", color: "#1A1033" },
  { points: "90,90 76.4,13.2 129,22.5", color: "#D9CEFA" },
  { points: "90,90 129,22.5 168,90", color: "#E6DEFC" },
];

// ستون‌های پرده که آخر کار پله‌پله بالا می‌رن — رنگ‌ها از همون پالت سایت.
const columns = ["#1A1033", "#7C5CE6", "#AD96F1", "#9479EC", "#C4B3F6"];

const BRAND = "WebPIKASO";
const SEEN_KEY = "webpikaso-intro";

/** انیمیشن ورود صفحه‌ی اصلی — فقط اولین بار در هر نشست مرورگر پخش می‌شه.
 *  شمارنده ۰ تا ۱۰۰، تکه‌های لوگو جمع می‌شن، اسم برند حرف‌به‌حرف بالا میاد،
 *  بعد همه‌چیز منفجر می‌شه و پرده‌ی ستونی کنار می‌ره و هیرو با یه تایم‌لاین
 *  جدا وارد می‌شه. با کلیک یا هر کلید، رد می‌شه. */
export default function IntroSplash() {
  const root = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (
      document.documentElement.hasAttribute("data-intro-seen") ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setDone(true);
      return;
    }

    const html = document.documentElement;
    html.style.overflow = "hidden";
    const counter = { v: 0 };
    const q = gsap.utils.selector(el);
    const heroItems = document.querySelectorAll("[data-hero-item]");

    const finish = () => {
      html.style.overflow = "";
      html.setAttribute("data-intro-seen", "");
      try {
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {}
    };

    const ctx = gsap.context(() => {
      gsap.set(heroItems, { autoAlpha: 0, y: 90, rotateX: 18, transformPerspective: 900 });

      const tl = gsap.timeline({ defaults: { ease: "expo.out" }, onComplete: () => setDone(true) });

      tl.from(q(".intro-piece"), {
        x: () => gsap.utils.random(-260, 260),
        y: () => gsap.utils.random(-260, 260),
        rotate: () => gsap.utils.random(-180, 180),
        scale: 0,
        opacity: 0,
        duration: 1.1,
        stagger: 0.06,
        transformOrigin: "50% 50%",
      })
        .to(
          counter,
          {
            v: 100,
            duration: 1.5,
            ease: "power2.inOut",
            onUpdate: () => {
              const n = q(".intro-count")[0];
              if (n) n.textContent = String(Math.round(counter.v)).padStart(3, "0");
            },
          },
          0
        )
        .fromTo(q(".intro-bar"), { scaleX: 0 }, { scaleX: 1, duration: 1.5, ease: "power2.inOut" }, 0)
        .from(q(".intro-char"), { yPercent: 120, rotate: 12, duration: 0.8, stagger: 0.05 }, 0.45)
        .from(q(".intro-tag"), { y: 20, opacity: 0, duration: 0.6 }, 0.9)
        .to(q(".intro-logo"), { rotate: 360, duration: 0.9, ease: "power3.inOut" }, 1.35)
        // انفجار تکه‌ها + محو محتوا
        .to(
          q(".intro-piece"),
          {
            x: () => gsap.utils.random(-900, 900),
            y: () => gsap.utils.random(-700, 700),
            rotate: () => gsap.utils.random(-360, 360),
            opacity: 0,
            duration: 0.9,
            ease: "power3.in",
            stagger: 0.02,
          },
          2.05
        )
        .to(q(".intro-char"), { yPercent: -120, duration: 0.5, stagger: 0.03, ease: "power3.in" }, 2.05)
        .to(q(".intro-meta"), { opacity: 0, duration: 0.3 }, 2.05)
        // پرده‌ی ستونی پله‌پله بالا می‌ره
        .to(q(".intro-col"), { yPercent: -100, duration: 0.9, stagger: 0.07, ease: "expo.inOut" }, 2.45)
        .add(finish, 2.9)
        // ورود هیرو
        .to(
          heroItems,
          { autoAlpha: 1, y: 0, rotateX: 0, duration: 1.2, stagger: 0.09, ease: "expo.out", clearProps: "transform,visibility,opacity" },
          2.85
        );

      const skip = () => tl.progress() < 0.75 && tl.timeScale(4);
      el.addEventListener("click", skip);
      window.addEventListener("keydown", skip, { once: true });
    }, el);

    return () => {
      ctx.revert();
      html.style.overflow = "";
    };
  }, []);

  if (done) return null;

  return (
    <div ref={root} className="intro-splash fixed inset-0 z-[1000] cursor-pointer select-none" aria-hidden>
      {/* پرده‌ی ستونی */}
      <div className="absolute inset-0 flex">
        {columns.map((c, i) => (
          <div key={i} className="intro-col h-full flex-1 bg-canvas" style={{ boxShadow: `inset 0 -8px 0 ${c}` }} />
        ))}
      </div>

      <div className="relative z-[1] flex h-full flex-col items-center justify-center gap-8 px-6">
        <svg viewBox="-10 -10 200 200" className="intro-logo h-[150px] w-[150px] overflow-visible sm:h-[190px] sm:w-[190px]">
          {pieces.map((p, i) => (
            <polygon
              key={i}
              className="intro-piece"
              points={p.points}
              fill={p.color}
              stroke="rgb(var(--color-canvas))"
              strokeWidth={2.5}
              strokeLinejoin="round"
            />
          ))}
        </svg>

        <div dir="ltr" className="flex overflow-hidden font-mono text-[44px] font-black leading-[1.1] tracking-tight text-ink sm:text-[76px]">
          {BRAND.split("").map((ch, i) => (
            <span key={i} className={`intro-char inline-block ${i >= 3 ? "text-accent" : ""}`}>
              {ch}
            </span>
          ))}
        </div>
        <p className="intro-tag -mt-4 text-[14px] font-bold text-dim sm:text-[16px]">ابزار پول‌سازی می‌سازیم.</p>

        <div className="intro-meta absolute inset-x-6 bottom-8 mx-auto flex max-w-container items-end justify-between gap-6 sm:inset-x-10 sm:bottom-10">
          <span className="font-mono text-[12px] font-bold text-dim">برای رد کردن کلیک کن</span>
          <div className="flex flex-1 items-center gap-4" dir="ltr">
            <span className="intro-count font-display text-[44px] leading-none text-ink sm:text-[64px]">000</span>
            <span className="h-[6px] flex-1 overflow-hidden rounded-full border border-accent/35">
              <span className="intro-bar block h-full w-full origin-left bg-accent" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
