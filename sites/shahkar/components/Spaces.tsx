"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

const PANELS = [
  {
    img: "hall-wide",
    kicker: "سالن سرپوشیده",
    title: "سقفی از نور طلایی",
    text: "خطوط نور گرم روی سقف، میزهای مشکی براق و پرده‌ی نورِ صحنه؛ آماده برای شب‌های اجرای زنده.",
  },
  {
    img: "hall-angle",
    kicker: "جزئیات",
    title: "نور، خط، آرامش",
    text: "نورپردازی خطی روی دیوارها و انعکاس طلایی روی میزها؛ فضایی مدرن با حس گرم.",
  },
  {
    img: "garden-front",
    kicker: "باغچه",
    title: "زیر نور فانوس‌ها",
    text: "چمن سبز، باغچه‌ی سیکاس و ردیف فانوس‌های رنگی؛ هوای آزاد شب‌های اسلام‌شهر.",
  },
  {
    img: "garden-tables",
    kicker: "فضای باز",
    title: "میزهای کنار باغ",
    text: "از فضای باز تا سالن تنها چند قدم فاصله است؛ هر جا که دلتان بخواهد.",
  },
  {
    img: "kitchen-garden",
    kicker: "آشپزخانه",
    title: "طعم‌هایی که جلوی چشمتان آماده می‌شوند",
    text: "آشپزخانه‌ی باز کنار باغ؛ کباب روی زغال و غذای تازه برای هر سفره.",
  },
  {
    img: "parking-yard",
    kicker: "پارکینگ اختصاصی",
    title: "از ماشین تا میز، چند قدم",
    text: "محوطه‌ی بزرگ پارکینگ زیر درخت‌ها، درست کنار ورودی باغ؛ بی‌دغدغه بیایید.",
  },
] as const;

/** Desktop: pinned horizontal journey through the venue. Mobile: stacked cards. */
export default function Spaces() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 900px)", () => {
        const el = track.current!;
        const distance = () => el.scrollWidth - window.innerWidth;
        const panels = gsap.utils.toArray<HTMLElement>(".space-panel");
        const imgs = panels.map((p) => gsap.quickSetter(p.querySelector("img"), "xPercent"));
        // Per-panel parallax + reveal computed from on-screen position (works for the RTL direction).
        const update = () => {
          const vw = window.innerWidth;
          panels.forEach((p, i) => {
            const r = p.getBoundingClientRect();
            const t = gsap.utils.clamp(-1, 1, (r.left + r.width / 2 - vw / 2) / vw);
            imgs[i](t * 10);
            p.classList.toggle("is-in", r.left < vw * 0.8 && r.right > vw * 0.2);
          });
        };
        gsap.to(el, {
          x: () => distance(), // RTL: content overflows to the left, so move right
          ease: "none",
          onUpdate: update,
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
            onRefresh: update,
          },
        });
        update();
        root.current!.classList.add("is-horizontal");
        gsap.to(".spaces-progress span", {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: () => `+=${distance()}`, scrub: true },
        });
        return () => root.current?.classList.remove("is-horizontal");
      });
      mm.add("(max-width: 899px)", () => {
        gsap.utils.toArray<HTMLElement>(".space-panel").forEach((p) => {
          gsap.from(p, { y: 60, autoAlpha: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: p, start: "top 85%" } });
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section className="spaces" id="spaces" ref={root}>
      <div className="spaces-track" ref={track}>
        <div className="space-intro">
          <span className="eyebrow">دو فضا، یک شاهکار</span>
          <h2 className="section-title">
            از سالن <em>تا باغ</em>
          </h2>
          <p className="section-lead">
            سالنی مدرن با نورپردازی طلایی و باغچه‌ای سرسبز زیر فانوس‌ها؛ قدم بزنید و ببینید.
          </p>
          <span className="space-hint">
            <svg viewBox="0 0 40 12" width="40" aria-hidden="true">
              <path d="M40 6H2M8 1L2 6l6 5" fill="none" stroke="currentColor" strokeWidth="1.2" />
            </svg>
            اسکرول کنید
          </span>
        </div>
        {PANELS.map((p, i) => (
          <article className="space-panel" key={p.img}>
            <div className="space-img">
              <img
                src={`/images/${p.img}.webp`}
                srcSet={`/images/${p.img}-sm.webp 800w, /images/${p.img}.webp 1500w`}
                sizes="(min-width: 900px) 60vw, 100vw"
                alt={`${p.kicker} — ${p.title}`}
                loading="lazy"
              />
            </div>
            <div className="space-copy">
              <span className="space-index">{["۰۱", "۰۲", "۰۳", "۰۴", "۰۵", "۰۶"][i]}</span>
              <span className="eyebrow">{p.kicker}</span>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </div>
          </article>
        ))}
      </div>
      <div className="spaces-progress" aria-hidden="true">
        <span />
      </div>
    </section>
  );
}
