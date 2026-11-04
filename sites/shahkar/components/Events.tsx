"use client";

import { motion } from "motion/react";
import { waLink } from "@/lib/site";
import { SectionHead } from "./Ornaments";

const EVENTS = [
  { t: "جشن تولد", d: "از تولدهای خانوادگی تا سورپرایزهای خاص، با کیک و دکور دلخواه." },
  { t: "عقد و نامزدی", d: "شروعی شاهانه برای زندگی مشترک، در سالن یا زیر آسمان باغ." },
  { t: "بله‌برون و پاگشا", d: "رسم‌های اصیل خانوادگی با پذیرایی ایرانی و فضای آرام." },
  { t: "سالگرد ازدواج", d: "یک میز دونفره زیر فانوس‌ها، یا جشنی با همه‌ی عزیزان." },
  { t: "دورهمی خانوادگی", d: "سفره‌ای بزرگ برای جمع‌های بزرگ؛ کودکان در فضای باز." },
  { t: "مهمانی‌های کاری", d: "پذیرایی از همکاران و مهمانان سازمانی با منوی اختصاصی." },
];

export default function Events() {
  return (
    <section className="section events" id="events">
      <SectionHead eyebrow="جشن‌ها و میهمانی‌ها" title={<>هر روز، <em>تمام‌وقت</em></>}>
        شاهکار آماده‌ی پذیرایی از جشن‌ها و میهمانی‌های شماست؛ از برنامه‌ریزی تا آخرین چای.
      </SectionHead>

      <div className="events-layout">
        <motion.figure
          className="events-photo"
          initial={{ clipPath: "inset(12% 12% 12% 12% round 220px 220px 24px 24px)", opacity: 0 }}
          whileInView={{ clipPath: "inset(0% 0% 0% 0% round 220px 220px 24px 24px)", opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <img
            src="/images/hall-wide.webp"
            srcSet="/images/hall-wide-sm.webp 800w, /images/hall-wide.webp 1500w"
            sizes="(min-width: 900px) 40vw, 100vw"
            alt="سالن پذیرایی شاهکار با نورپردازی طلایی و صحنه‌ی نور"
            loading="lazy"
          />
          <figcaption>
            <b>۲۴/۷</b>
            <span>آماده‌ی میزبانی</span>
          </figcaption>
        </motion.figure>

        <ol className="events-list">
          {EVENTS.map((e, i) => (
            <motion.li
              key={e.t}
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.7, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
            >
              <a href={waLink(`سلام، برای «${e.t}» در باغچه رستوران شاهکار اطلاعات می‌خواستم.`)} target="_blank" rel="noreferrer">
                <span className="ev-num">{["۰۱", "۰۲", "۰۳", "۰۴", "۰۵", "۰۶"][i]}</span>
                <span className="ev-body">
                  <b>{e.t}</b>
                  <small>{e.d}</small>
                </span>
                <span className="ev-arrow" aria-hidden="true">
                  ←
                </span>
              </a>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
