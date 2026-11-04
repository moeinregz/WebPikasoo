"use client";
import { Children, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

/** ردیف افقی محصولات: روی گوشی با کشیدن (سوایپ) و روی دسکتاپ با دکمه‌های قبلی/بعدی */
export default function ProductRail({ title, subtitle, more, children }: { title: string; subtitle?: string; more?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [idx, setIdx] = useState(0);
  const count = Children.count(children);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const pos = Math.abs(el.scrollLeft); // در RTL مقدار منفیه
    setAtStart(pos < 8);
    setAtEnd(pos > max - 8);
    const first = el.firstElementChild as HTMLElement | null;
    if (first) {
      const step = first.offsetWidth + 12;
      setIdx(Math.min(count - 1, Math.round(pos / step)));
    }
  }, [count]);

  useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return;
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const go = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const first = el.firstElementChild as HTMLElement | null;
    const step = first ? first.offsetWidth + 16 : el.clientWidth * 0.8;
    const isRtl = getComputedStyle(el).direction === "rtl";
    // «بعدی» در صفحه‌ی راست‌به‌چپ یعنی حرکت به سمت چپ
    el.scrollBy({ left: (isRtl ? -1 : 1) * dir * step, behavior: "smooth" });
  };

  return (
    <section className="section">
      <div className="section-head">
        <h2>
          {title}
          {subtitle && <small>{subtitle}</small>}
        </h2>
        <div className="rail-ctl">
          {more && <Link href={more}>مشاهده همه</Link>}
          <button className="rail-btn" onClick={() => go(-1)} disabled={atStart} aria-label="قبلی">›</button>
          <button className="rail-btn" onClick={() => go(1)} disabled={atEnd} aria-label="بعدی">‹</button>
        </div>
      </div>
      <div className="rail" ref={ref}>
        {children}
      </div>
      <div className="rail-dots" aria-hidden="true">
        {Array.from({ length: count }).map((_, i) => (
          <i key={i} className={i === idx ? "on" : ""} />
        ))}
      </div>
    </section>
  );
}
