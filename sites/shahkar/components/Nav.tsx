"use client";

import { useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { SITE } from "@/lib/site";

const LINKS = [
  ["#features", "امتیازها"],
  ["#spaces", "فضاها"],
  ["#menu", "منو"],
  ["#music", "موسیقی زنده"],
  ["#events", "مراسم"],
  ["#gallery", "گالری"],
  ["#location", "مسیر"],
] as const;

export default function Nav() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setSolid(y > 40);
    setHidden(y > prev && y > 320 && !open);
  });

  return (
    <>
      <motion.nav
        className={`nav ${solid ? "is-solid" : ""}`}
        animate={{ y: hidden ? "-110%" : "0%" }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <a href="#home" className="nav-brand" aria-label="شاهکار — صفحه اصلی">
          <span className="nav-brand-name">شاهکار</span>
          <span className="nav-brand-sub">باغچه رستوران</span>
        </a>
        <ul className="nav-links">
          {LINKS.map(([href, label]) => (
            <li key={href}>
              <a href={href}>{label}</a>
            </li>
          ))}
        </ul>
        <div className="nav-actions">
          <a href={SITE.phoneHref} className="nav-phone" aria-label="تماس تلفنی">
            {SITE.phone}
          </a>
          <a href="#reserve" className="btn btn-gold btn-sm">
            رزرو
          </a>
          <button
            className={`burger ${open ? "is-open" : ""}`}
            aria-label={open ? "بستن منو" : "باز کردن منو"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            <span />
            <span />
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {open && (
          <motion.div
            className="drawer"
            initial={{ clipPath: "circle(0% at 8% 4%)" }}
            animate={{ clipPath: "circle(150% at 8% 4%)" }}
            exit={{ clipPath: "circle(0% at 8% 4%)" }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          >
            <ul>
              {LINKS.map(([href, label], i) => (
                <motion.li
                  key={href}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + i * 0.06 }}
                >
                  <a href={href} onClick={() => setOpen(false)}>
                    {label}
                  </a>
                </motion.li>
              ))}
            </ul>
            <div className="drawer-foot">
              <a href={SITE.phoneHref}>{SITE.phone}</a>
              <a href={SITE.instagramHref} target="_blank" rel="noreferrer" dir="ltr">
                @{SITE.instagram}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
