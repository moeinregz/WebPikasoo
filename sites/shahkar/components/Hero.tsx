"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { onReady } from "@/lib/ready";
import { SITE } from "@/lib/site";
import Fireflies from "./Fireflies";
import Lanterns from "./Lanterns";
import { Divider } from "./Ornaments";

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const reduce = prefersReducedMotion();
    const ctx = gsap.context(() => {
      const intro = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } });
      intro
        .from(".hero-media img", { scale: 1.25, duration: 2.4, ease: "power2.out" })
        .from(".hero-eyebrow", { y: 20, autoAlpha: 0, duration: 1 }, 0.2)
        .fromTo(
          ".hero-title-text",
          { clipPath: "inset(0 0 100% 0)", y: 60 },
          { clipPath: "inset(0 0 0% 0)", y: 0, duration: 1.6 },
          0.35,
        )
        .from(".hero .divider", { scaleX: 0, autoAlpha: 0, duration: 1.2 }, 0.9)
        .from(".hero-lead", { y: 30, autoAlpha: 0, duration: 1.1 }, 1)
        .from(".hero-cta > *", { y: 24, autoAlpha: 0, stagger: 0.12, duration: 1 }, 1.15)
        .from(".hero-badges li", { y: 16, autoAlpha: 0, stagger: 0.08, duration: 0.8 }, 1.3)
        .from(".lamp", { y: -200, stagger: { each: 0.07, from: "random" }, duration: 1.6, ease: "elastic.out(1,0.5)" }, 0.4)
        .from(".scroll-cue", { autoAlpha: 0, duration: 1 }, 1.8);

      if (reduce) intro.progress(1);
      const off = onReady(() => intro.play());

      if (!reduce) {
        // Scroll: image drifts and darkens, content lifts away.
        gsap.to(".hero-media img", {
          yPercent: 18,
          scale: 1.08,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
        });
        gsap.to(".hero-content", {
          yPercent: -30,
          autoAlpha: 0,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "20% top", end: "80% top", scrub: true },
        });
        gsap.to(".hero-shade", {
          opacity: 1,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
        });
      }
      return off;
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section className="hero" id="home" ref={root}>
      <div className="hero-media">
        <img
          src="/images/garden-front.webp"
          srcSet="/images/garden-front-sm.webp 800w, /images/garden-front.webp 1500w"
          sizes="100vw"
          alt="باغچه رستوران شاهکار در شب، با فانوس‌های رنگی و چمن سبز"
          fetchPriority="high"
        />
      </div>
      <div className="hero-vignette" />
      <div className="hero-shade" />
      <Fireflies />
      <Lanterns />

      <div className="hero-content">
        <p className="hero-eyebrow">
          <span className="dot" /> باغچه رستوران · {SITE.city}
        </p>
        <h1 className="hero-title">
          <span className="hero-title-text">شاهکار</span>
        </h1>
        <Divider />
        <p className="hero-lead">
          جایی که شب‌ها طلایی می‌شوند؛ جشن‌ها و میهمانی‌های شما، موسیقی زنده و طعم اصیل ایرانی
          — زیر نور فانوس‌های باغ.
        </p>
        <div className="hero-cta">
          <a href="#reserve" className="btn btn-gold btn-lg">
            رزرو میز و مراسم
          </a>
          <a href={SITE.phoneHref} className="btn btn-ghost btn-lg">
            <PhoneIcon /> {SITE.phone}
          </a>
        </div>
        <ul className="hero-badges">
          <li>پذیرایی تمام‌وقت</li>
          <li>موسیقی زنده</li>
          <li>پارکینگ اختصاصی</li>
        </ul>
      </div>

      <a href="#features" className="scroll-cue" aria-label="ادامه">
        <span className="scroll-cue-line" />
        <span>ورود به باغ</span>
      </a>
    </section>
  );
}

export function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2" />
    </svg>
  );
}

