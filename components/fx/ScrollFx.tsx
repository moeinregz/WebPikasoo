"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

/** همه‌ی انیمیشن‌های اسکرولیِ صفحه‌ی اصلی با GSAP، از روی data-attribute ها:
 *
 *  - data-speed="0.3"       پارالاکس؛ عدد مثبت = کندتر از اسکرول
 *  - section h2.font-display تیترها کلمه‌به‌کلمه از پشت ماسک بالا میان
 *  - data-gsap="zoom"       از کوچیک و گرد به اندازه‌ی کامل، هم‌گام با اسکرول
 *  - data-gsap="draw"       خط‌ها هم‌گام با اسکرول از راست کشیده می‌شن
 *  - data-gsap="pop"        بچه‌های مستقیم با فنر یکی‌یکی «می‌پرن» بیرون
 *  - data-marquee           ردیف‌های نوار متحرک با سرعت اسکرول کج می‌شن
 *
 *  با prefers-reduced-motion هیچ‌کدوم اجرا نمی‌شه. */
export default function ScrollFx() {
  useEffect(() => {
    const mm = gsap.matchMedia();

    // Heavy, scroll-linked effects (parallax, word-split headings, zoom,
    // marquee skew) only on larger screens; phones keep the light ones.
    mm.add("(prefers-reduced-motion: no-preference) and (min-width: 768px)", () => {
      gsap.utils.toArray<HTMLElement>("[data-speed]").forEach((el) => {
        const speed = parseFloat(el.dataset.speed || "0");
        gsap.to(el, {
          y: () => speed * 260,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true },
        });
      });

      const splits: SplitText[] = [];
      gsap.utils.toArray<HTMLElement>("section h2.font-display").forEach((h) => {
        const split = SplitText.create(h, { type: "words", mask: "words", wordsClass: "split-word" });
        splits.push(split);
        gsap.from(split.words, {
          yPercent: 115,
          rotate: 6,
          duration: 1,
          ease: "expo.out",
          stagger: 0.07,
          scrollTrigger: { trigger: h, start: "top 88%", once: true },
        });
      });

      gsap.utils.toArray<HTMLElement>('[data-gsap="zoom"]').forEach((el) => {
        gsap.fromTo(
          el,
          { scale: 0.84, borderRadius: "64px", rotate: -2 },
          {
            scale: 1,
            borderRadius: "24px",
            rotate: 0,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "top 35%", scrub: 0.6 },
          }
        );
      });

      const rows = gsap.utils.toArray<HTMLElement>("[data-marquee]");
      if (rows.length) {
        const skewTo = rows.map((r) => gsap.quickTo(r, "skewX", { duration: 0.5, ease: "power3" }));
        ScrollTrigger.create({
          onUpdate: (self) => {
            const v = gsap.utils.clamp(-14, 14, self.getVelocity() / -140);
            skewTo.forEach((fn) => fn(v));
          },
        });
      }

      return () => splits.forEach((s) => s.revert());
    });

    // بعد از لود عکس‌ها و فونت‌ها ارتفاع صفحه عوض می‌شه
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.utils.toArray<HTMLElement>('[data-gsap="draw"]').forEach((el) => {
        gsap.fromTo(
          el,
          { scaleX: 0, transformOrigin: "100% 50%" },
          { scaleX: 1, ease: "none", scrollTrigger: { trigger: el, start: "top 85%", end: "top 45%", scrub: 0.5 } }
        );
      });

      gsap.utils.toArray<HTMLElement>('[data-gsap="pop"]').forEach((el) => {
        gsap.from(el.children, {
          scale: 0,
          rotate: -25,
          duration: 0.8,
          ease: "back.out(2.2)",
          stagger: 0.12,
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        });
      });

    });

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    document.fonts?.ready.then(refresh);

    return () => {
      window.removeEventListener("load", refresh);
      mm.revert();
    };
  }, []);

  return null;
}
