"use client";

import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { SITE, waLink } from "@/lib/site";
import { SectionHead } from "./Ornaments";

/** Stylised route map: Golddasteh square → Firouz Bahram entrance → Shahkar (opposite Chaharbagh). */
export default function Location({ hasGate = false }: { hasGate?: boolean }) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) return;
      const tl = gsap.timeline({
        scrollTrigger: { trigger: ".map", start: "top 75%", end: "bottom 60%", scrub: 1 },
      });
      tl.fromTo(".map-route", { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: "none", duration: 1 })
        .from(".map-step", { autoAlpha: 0, y: 10, stagger: 0.3, duration: 0.2 }, 0)
        .from(".map-pin", { scale: 0, transformOrigin: "50% 100%", ease: "back.out(3)", duration: 0.25 }, 0.85);
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section className="section location" id="location" ref={root}>
      <SectionHead eyebrow="مسیر" title={<>تا <em>شاهکار</em> راهی نیست</>} />
      <div className="location-layout">
        <div className="map" data-reveal>
          <svg viewBox="0 0 600 380" role="img" aria-label="نقشه‌ی مسیر: میدان گل‌دسته، ورودی فیروزبهرام، باغچه رستوران شاهکار روبه‌روی چهارباغ">
            <defs>
              <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
                <path d="M24 0H0V24" fill="none" stroke="rgba(217,180,90,.07)" />
              </pattern>
              <radialGradient id="pinGlow">
                <stop offset="0" stopColor="#f3d98b" stopOpacity=".7" />
                <stop offset="1" stopColor="#f3d98b" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="600" height="380" fill="url(#grid)" />
            {/* roads */}
            <path d="M0 120H600" className="map-road" />
            <path d="M210 120V380" className="map-road" />
            <circle cx="470" cy="120" r="30" className="map-square" />
            <circle cx="470" cy="120" r="12" fill="rgba(217,180,90,.25)" />
            {/* gardens */}
            <g className="map-plot">
              <rect x="88" y="196" width="104" height="80" rx="10" />
              <text x="140" y="242" textAnchor="middle">چهارباغ</text>
            </g>
            <g className="map-plot is-ours">
              <rect x="228" y="196" width="118" height="80" rx="10" />
              <text x="287" y="242" textAnchor="middle">شاهکار</text>
            </g>
            {/* route */}
            <path
              className="map-route"
              pathLength={1}
              d="M590 120H500A30 30 0 0 0 440 120H210V236H228"
            />
            {/* labels */}
            <g className="map-step">
              <text x="470" y="74" textAnchor="middle">میدان گل‌دسته</text>
            </g>
            <g className="map-step">
              <text x="210" y="100" textAnchor="middle">ورودی فیروزبهرام</text>
            </g>
            <g className="map-step">
              <text x="210" y="320" textAnchor="middle" className="map-small">اولین باغچه</text>
            </g>
            <g className="map-pin">
              <circle cx="287" cy="182" r="34" fill="url(#pinGlow)" className="map-pulse" />
              <path d="M287 196c-12-14-18-23-18-31a18 18 0 0 1 36 0c0 8-6 17-18 31z" fill="#d9b45a" />
              <circle cx="287" cy="165" r="6" fill="#0a0907" />
            </g>
            <text x="18" y="112" className="map-small">اسلام‌شهر</text>
          </svg>
        </div>

        <div className="location-info" data-reveal>
          <ol className="steps">
            <li><b>۱</b> میدان گل‌دسته را رد کنید</li>
            <li><b>۲</b> وارد ورودی فیروزبهرام شوید</li>
            <li><b>۳</b> اولین باغچه، روبه‌روی باغچه رستوران چهارباغ</li>
            <li><b>۴</b> سردر با تابلوی سبز نورانی «باغچه رستوران سنتی»</li>
          </ol>
          <address>{SITE.address}</address>
          <a className="parking-note" href="#parking">
            <span className="p-badge">P</span> پارکینگ اختصاصی برای مهمانان
          </a>
          <div className="location-actions">
            <a className="btn btn-gold" href={SITE.mapHref} target="_blank" rel="noreferrer">
              مسیریابی
            </a>
            <a className="btn btn-ghost" href={waLink("سلام، لطفاً لوکیشن باغچه رستوران شاهکار را بفرستید.")} target="_blank" rel="noreferrer">
              دریافت لوکیشن در واتساپ
            </a>
          </div>
        </div>
      </div>

      {hasGate && (
        <motion.figure
          className="gate"
          initial={{ clipPath: "inset(0 50% 0 50% round 24px)" }}
          whileInView={{ clipPath: "inset(0 0% 0 0% round 24px)" }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1.4, ease: [0.76, 0, 0.24, 1] }}
        >
          <img
            src="/images/gate-sm.webp"
            srcSet="/images/gate-sm.webp 800w, /images/gate.webp 1500w"
            sizes="(min-width: 900px) 80vw, 100vw"
            alt="سردر ورودی باغ با تابلوی سبز نورانی «باغچه رستوران سنتی» و ریسه‌های رنگی"
            loading="lazy"
          />
          <figcaption>
            <span className="eyebrow">نشانه‌ی ورودی</span>
            <b>دنبال این سردر بگردید</b>
            <small>تابلوی سبز نورانی «باغچه رستوران سنتی» و ریسه‌های رنگی روی درخت کنار در</small>
          </figcaption>
        </motion.figure>
      )}

      <div className="parking" id="parking">
        <div className="parking-copy" data-reveal>
          <span className="p-badge p-badge-lg">P</span>
          <h3>پارکینگ اختصاصی</h3>
          <p>
            محوطه‌ای بزرگ و روشن، زیر سایه‌ی درخت‌ها و درست کنار ورودی باغ. ماشین را پارک کنید و
            با خیال راحت از شب لذت ببرید؛ بدون گشتن دنبال جای پارک در خیابان.
          </p>
          <ul className="parking-points">
            <li>محوطه‌ی وسیع شنی</li>
            <li>روشنایی در تمام ساعات شب</li>
            <li>چند قدم تا میزها</li>
          </ul>
        </div>
        <div className="parking-photos">
          {[
            ["parking-yard", "محوطه‌ی پارکینگ اختصاصی شاهکار در شب، زیر درخت‌ها و ریسه‌ی چراغ"],
            ["parking-well", "ورودی باغ کنار پارکینگ، با چاه آب تزئینی و گلدان‌ها"],
          ].map(([src, alt], i) => (
            <motion.figure
              key={src}
              className={`parking-photo pp-${i}`}
              initial={{ opacity: 0, y: 60, rotate: i ? 3 : -3 }}
              whileInView={{ opacity: 1, y: 0, rotate: i ? 2 : -2 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 1, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              <img src={`/images/${src}-sm.webp`} srcSet={`/images/${src}-sm.webp 800w, /images/${src}.webp 1500w`} sizes="(min-width: 900px) 30vw, 90vw" alt={alt} loading="lazy" />
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
