"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

type Slide = {
  title: string;
  accent: string;
  image: string;
};

/** سه نمونه‌سایتی که تیم طراحی کرده — هر اسلاید فقط عکس واقعی سایت
 *  + یه عنوان کوتاه داره، بدون کیکر و بدون توضیح اضافه. */
const slides: Slide[] = [
  {
    title: "فروشگاه تخصصی صنعت قارچ",
    accent: "#2E7D32",
    image: "/work/site-mushroom-shop.webp",
  },
  {
    title: "پلتفرم بازار بین‌المللی",
    accent: "#E85D04",
    image: "/work/site-market-dashboard.webp",
  },
  {
    title: "پنل مدیریت فروشگاه",
    accent: "#0077B6",
    image: "/work/site-novapanel.webp",
  },
];

const AUTOPLAY_MS = 4800;

/** اسلایدر هیرو — بدون طرح ترمینال؛ یه قاب ساده و مربعی (۱:۱) که سه
 *  نمونه‌سایت رو با کراس‌فید نرم نشون می‌ده. با هاور مکث می‌کنه و
 *  نقطه‌ها/فلش‌ها کنترل دستی می‌دن. روی هر اسلاید فقط یه عنوان کوتاهه. */
export default function HeroSlider() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((i: number) => {
    setIndex(((i % slides.length) + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, AUTOPLAY_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused]);

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="group relative overflow-hidden rounded-card border border-ink/10 bg-[#0a0a0c] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)]"
    >
      {/* بدنه‌ی اسلایدر — قاب مربعی ۱ در ۱ */}
      <div className="relative aspect-square w-full overflow-hidden">
        {slides.map((s, i) => (
          <div
            key={s.title}
            aria-hidden={i !== index}
            className="absolute inset-0 transition-opacity duration-700 ease-out"
            style={{ opacity: i === index ? 1 : 0, pointerEvents: i === index ? "auto" : "none" }}
          >
            <Image
              src={s.image}
              alt={s.title}
              fill
              sizes="(min-width: 1024px) 560px, 100vw"
              priority={i === 0}
              className="object-cover"
            />

            {/* گرادیان تیره از پایین فقط برای خوانا موندن عنوان */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

            {/* فقط عنوان روی اسلاید */}
            <div className="absolute inset-x-0 bottom-0 z-[1] p-5 sm:p-7">
              <h3 className="font-display text-[20px] font-normal leading-tight text-white sm:text-[25px]">
                {s.title}
              </h3>
            </div>
          </div>
        ))}

        {/* فلش‌های ناوبری — فقط با هاور روی قاب دیده می‌شن */}
        <button
          type="button"
          onClick={() => goTo(index - 1)}
          aria-label="اسلاید قبلی"
          className="absolute right-3 top-1/2 z-[2] flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white opacity-0 backdrop-blur-sm transition duration-300 group-hover:opacity-100 hover:bg-black/60"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => goTo(index + 1)}
          aria-label="اسلاید بعدی"
          className="absolute left-3 top-1/2 z-[2] flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white opacity-0 backdrop-blur-sm transition duration-300 group-hover:opacity-100 hover:bg-black/60"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
            <path d="M15 6l-6 6 6 6" />
          </svg>
        </button>
      </div>

      {/* نقطه‌ها + نوار پیشرفت اتوپلی */}
      <div className="relative z-[2] flex items-center justify-center gap-2.5 border-t border-white/10 bg-white/[0.02] px-4 py-3.5">
        {slides.map((s, i) => (
          <button
            key={s.title}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`رفتن به اسلاید ${i + 1}`}
            className="group/dot relative h-1.5 w-8 overflow-hidden rounded-full bg-white/10"
          >
            {i === index && (
              <span
                key={`${index}-${paused}`}
                className="hero-slide-progress absolute inset-y-0 right-0 rounded-full"
                style={{
                  background: s.accent,
                  animationDuration: `${AUTOPLAY_MS}ms`,
                  animationPlayState: paused ? "paused" : "running",
                }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
