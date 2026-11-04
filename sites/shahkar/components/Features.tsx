"use client";

import { motion, useMotionTemplate, useMotionValue, useSpring } from "motion/react";
import type { PointerEvent } from "react";
import { FEATURES } from "@/lib/site";
import { SectionHead } from "./Ornaments";

const ICONS: Record<(typeof FEATURES)[number]["key"], React.ReactNode> = {
  events: (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="24" cy="26" r="16" />
      <path d="M24 16v10l7 5" />
      <path d="M18 6h12M24 6v4" />
      <path d="M38 12l3-3M10 12l-3-3" />
    </svg>
  ),
  parking: (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="7" y="7" width="34" height="34" rx="8" />
      <path d="M19 34V14h7a6 6 0 0 1 0 12h-7" />
    </svg>
  ),
  food: (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M6 34h36M9 34a15 15 0 0 1 30 0" />
      <path d="M24 15v-3M21 12h6" />
      <path d="M8 39h32" />
      <path d="M17 27q3-4 7-4" opacity=".6" />
    </svg>
  ),
  music: (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M18 36V10l20-4v26" />
      <circle cx="13" cy="36" r="5" />
      <circle cx="33" cy="32" r="5" />
      <path d="M18 17l20-4" />
    </svg>
  ),
  stars: (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M24 5l5.6 11.4 12.6 1.8-9.1 8.9 2.1 12.5L24 33.7l-11.2 5.9 2.1-12.5-9.1-8.9 12.6-1.8z" />
      <path d="M24 14v4M24 26v2" opacity=".6" />
    </svg>
  ),
};

function Card({ f, i }: { f: (typeof FEATURES)[number]; i: number }) {
  const mx = useMotionValue(50);
  const my = useMotionValue(50);
  const rx = useSpring(0, { stiffness: 160, damping: 18 });
  const ry = useSpring(0, { stiffness: 160, damping: 18 });
  const shine = useMotionTemplate`radial-gradient(420px circle at ${mx}% ${my}%, rgba(243,217,139,.16), transparent 45%)`;

  const onMove = (e: PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * 100;
    const py = ((e.clientY - r.top) / r.height) * 100;
    mx.set(px);
    my.set(py);
    ry.set((px - 50) / 9);
    rx.set(-(py - 50) / 9);
  };
  const onLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <motion.article
      className={`feature feature-${f.key}`}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.9, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] }}
      style={{ rotateX: rx, rotateY: ry }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <motion.span className="feature-shine" style={{ background: shine }} />
      <span className="feature-num">{["۰۱", "۰۲", "۰۳", "۰۴", "۰۵"][i]}</span>
      <div className="feature-icon">{ICONS[f.key]}</div>
      <h3>{f.title}</h3>
      <p>{f.text}</p>
      <span className="feature-corner" />
    </motion.article>
  );
}

export default function Features() {
  return (
    <section className="section features" id="features">
      <SectionHead eyebrow="چرا شاهکار؟" title={<>میزبانی، <em>به رسم شاهانه</em></>}>
        هر آنچه برای یک شب به‌یادماندنی لازم است، در یک باغ جمع شده.
      </SectionHead>
      <div className="feature-grid">
        {FEATURES.map((f, i) => (
          <Card key={f.key} f={f} i={i} />
        ))}
      </div>
    </section>
  );
}
