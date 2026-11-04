"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { imgSrc } from "./ProductArt";

export type HeroSlide = { id: number; title: string; subtitle: string; button_text: string; button_link: string; image: string; bg: string; emoji: string };

const INTERVAL = 3000;

/** فایل svg = تصویرسازی کنار متن؛ عکس معمولی (jpg/png/webp) = پس‌زمینه‌ی کامل اسلاید */
const isArt = (src: string) => /\.svg(\?|$)/i.test(src); // هر ۳ ثانیه اسلاید بعدی

export default function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [tick, setTick] = useState(0); // برای ریست نوار پیشرفت
  const start = useRef<{ x: number; y: number } | null>(null);
  const n = slides.length;

  const go = useCallback(
    (to: number) => {
      setI(((to % n) + n) % n);
      setTick((t) => t + 1);
    },
    [n]
  );

  useEffect(() => {
    if (n < 2 || paused) return;
    const t = setTimeout(() => go(i + 1), INTERVAL);
    return () => clearTimeout(t);
  }, [i, n, paused, go, tick]);

  useEffect(() => {
    const onVis = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  if (!n) return null;

  return (
    <div className="container">
    <div
      className="hero"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => {
        start.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        setPaused(true);
      }}
      onTouchEnd={(e) => {
        const s = start.current;
        start.current = null;
        setPaused(false);
        if (!s) return;
        const dx = e.changedTouches[0].clientX - s.x;
        const dy = e.changedTouches[0].clientY - s.y;
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) go(dx > 0 ? i + 1 : i - 1); // راست‌به‌چپ: کشیدن به راست = بعدی
      }}
      aria-roledescription="carousel"
    >
      <div className="track" style={{ transform: `translateX(${i * 100}%)` }}>
        {slides.map((s, k) => (
          <div
            key={s.id}
            className={`slide ${k === i ? "active" : ""} ${s.image && !isArt(s.image) ? "has-img" : ""}`}
            style={{ background: `linear-gradient(120deg, ${s.bg}, #1f130c)` }}
            aria-hidden={k !== i}
          >
            {s.image && !isArt(s.image) && <img className="bg" src={imgSrc(s.image)} alt="" />}
            {s.image && isArt(s.image) && <img className="art-img" src={imgSrc(s.image)} alt="" />}
            {!s.image && <span className="art" aria-hidden="true">{s.emoji}</span>}
            <div className="copy">
              <h2>{s.title}</h2>
              <p>{s.subtitle}</p>
              {s.button_text && (
                <Link className="btn gold" href={s.button_link || "/shop"} tabIndex={k === i ? 0 : -1}>
                  {s.button_text}
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
      {n > 1 && (
        <>
          {!paused && <span key={tick + "-" + i} className="progress" style={{ animation: `heroProgress ${INTERVAL}ms linear forwards` }} />}
          <button className="arrow prev" onClick={() => go(i - 1)} aria-label="اسلاید قبلی">›</button>
          <button className="arrow next" onClick={() => go(i + 1)} aria-label="اسلاید بعدی">‹</button>
          <div className="dots">
            {slides.map((s, k) => (
              <button key={s.id} className={k === i ? "on" : ""} onClick={() => go(k)} aria-label={`اسلاید ${k + 1}`} />
            ))}
          </div>
        </>
      )}
      <style>{`@keyframes heroProgress{from{width:0}to{width:100%}}`}</style>
    </div>
    </div>
  );
}
