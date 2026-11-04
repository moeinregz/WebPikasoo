"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { SectionHead } from "./Ornaments";

const PHOTOS = [
  { src: "hall-wide", alt: "سالن اصلی شاهکار با سقف نورپردازی‌شده و صحنه‌ی نور", cls: "g-wide" },
  { src: "garden-front", alt: "نمای باغچه در شب با فانوس‌های رنگی", cls: "g-tall" },
  { src: "hall-angle", alt: "نورپردازی خطی و انعکاس طلایی روی میزها", cls: "" },
  { src: "garden-tables", alt: "میزهای فضای باز روی چمن", cls: "" },
  { src: "kitchen-garden", alt: "آشپزخانه‌ی باز کنار باغ", cls: "g-wide" },
];

export default function Gallery() {
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowLeft") setOpen((o) => (o === null ? o : (o + 1) % PHOTOS.length));
      if (e.key === "ArrowRight") setOpen((o) => (o === null ? o : (o - 1 + PHOTOS.length) % PHOTOS.length));
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <section className="section gallery" id="gallery">
      <SectionHead eyebrow="گالری" title={<>قاب‌هایی از <em>شاهکار</em></>} />
      <div className="gallery-grid">
        {PHOTOS.map((p, i) => (
          <motion.button
            key={p.src}
            className={`g-item ${p.cls}`}
            onClick={() => setOpen(i)}
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.8, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            aria-label={`بزرگ‌نمایی: ${p.alt}`}
          >
            <motion.img
              layoutId={`photo-${p.src}`}
              src={`/images/${p.src}-sm.webp`}
              alt={p.alt}
              loading="lazy"
            />
            <span className="g-zoom" aria-hidden="true">
              +
            </span>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {open !== null && (
          <motion.div
            className="lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={PHOTOS[open].alt}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
          >
            <motion.img
              layoutId={`photo-${PHOTOS[open].src}`}
              src={`/images/${PHOTOS[open].src}.webp`}
              alt={PHOTOS[open].alt}
              onClick={(e) => e.stopPropagation()}
              transition={{ type: "spring", stiffness: 220, damping: 28 }}
            />
            <p className="lb-caption">{PHOTOS[open].alt}</p>
            <button className="lb-close" onClick={() => setOpen(null)} aria-label="بستن">
              ×
            </button>
            <button
              className="lb-nav lb-prev"
              aria-label="قبلی"
              onClick={(e) => {
                e.stopPropagation();
                setOpen((open - 1 + PHOTOS.length) % PHOTOS.length);
              }}
            >
              ›
            </button>
            <button
              className="lb-nav lb-next"
              aria-label="بعدی"
              onClick={(e) => {
                e.stopPropagation();
                setOpen((open + 1) % PHOTOS.length);
              }}
            >
              ‹
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
