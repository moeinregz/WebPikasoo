"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { toFa } from "@/lib/fa";
import { SectionHead } from "./Ornaments";

export type MenuData = {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  items: { id: number; name: string; description: string; price: number | null; featured: number }[];
}[];

export default function Menu({ data }: { data: MenuData }) {
  const cats = data.filter((c) => c.items.length);
  const [active, setActive] = useState(cats[0]?.slug);
  const cat = cats.find((c) => c.slug === active) ?? cats[0];
  if (!cat) return null;

  return (
    <section className="section menu" id="menu">
      <div className="menu-bg" aria-hidden="true" />
      <SectionHead eyebrow="سفره‌ی شاهکار" title={<>طعم اصیل <em>ایرانی</em></>}>
        از کباب‌های زغالی تا خورش‌های خانگی؛ هر بشقاب با حوصله و به رسم مهمان‌نوازی ایرانی.
      </SectionHead>

      <div className="menu-tabs" role="tablist" aria-label="دسته‌بندی منو">
        {cats.map((c) => (
          <button
            key={c.slug}
            role="tab"
            aria-selected={c.slug === cat.slug}
            className={`menu-tab ${c.slug === cat.slug ? "is-active" : ""}`}
            onClick={() => setActive(c.slug)}
          >
            {c.slug === cat.slug && (
              <motion.span layoutId="menu-pill" className="menu-pill" transition={{ type: "spring", stiffness: 380, damping: 32 }} />
            )}
            <span className="menu-tab-label">{c.title}</span>
          </button>
        ))}
      </div>

      <div className="menu-board">
        <span className="menu-corner tl" />
        <span className="menu-corner tr" />
        <span className="menu-corner bl" />
        <span className="menu-corner br" />
        <AnimatePresence mode="wait">
          <motion.div
            key={cat.slug}
            initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -16, filter: "blur(6px)" }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="menu-sub">{cat.subtitle}</p>
            <ul className="menu-list">
              {cat.items.map((it, i) => (
                <motion.li
                  key={it.id}
                  className={`menu-item ${it.featured ? "is-featured" : ""}`}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 + i * 0.06, duration: 0.5 }}
                >
                  <div className="menu-line">
                    <h3>{it.name}</h3>
                    <span className="menu-dots" />
                    <span className="menu-price">
                      {it.price != null ? `${toFa(it.price.toLocaleString("en"))} تومان` : ""}
                    </span>
                  </div>
                  <p>{it.description}</p>
                  {it.featured ? <span className="menu-badge">پیشنهاد سرآشپز</span> : null}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>
      </div>
      <p className="menu-note">منوی کامل و قیمت‌ها را حضوری یا با یک تماس بپرسید؛ برای مراسم، منوی اختصاصی هم آماده می‌کنیم.</p>
    </section>
  );
}
