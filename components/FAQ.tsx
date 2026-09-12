"use client";

import { useState } from "react";
import Reveal from "./Reveal";

type FaqItem = { q: string; a: string };

// هر سوال دقیقاً روی یه اعتراض/نگرانی رایج قبل از خرید جواب می‌ده —
// قیمت، زمان، مالکیت سایت، پشتیبانی، تعهد و نحوه‌ی شروع.
const faqs: FaqItem[] = [
  {
    q: "قیمت‌هایی که رو سایت نوشته شده قطعیه؟",
    a: "قیمت‌های صفحه‌ی تعرفه‌ها نقطه‌ی شروع مذاکره‌ن، نه قیمت نهایی. بعد از یه مشاوره‌ی کوتاه و رایگان که نیاز دقیقت رو بشنویم، یه پیشنهاد مکتوب و قطعی برات می‌فرستیم — قبل از اون هیچ تعهدی نداری.",
  },
  {
    q: "پروژه‌م چقدر طول می‌کشه؟",
    a: "بستگی به نوع و حجم پروژه داره. تو همون جلسه‌ی اول، بعد از شنیدن نیازت، یه زمان‌بندی مشخص و مکتوب بهت می‌دیم — و در طول مسیر هم با گزارش هفتگی می‌بینی دقیقاً کجای کاری.",
  },
  {
    q: "بعد از تحویل، سایت واقعاً مال خودمه؟",
    a: "بله. سورس کامل پروژه رو تحویل می‌گیری؛ بدون قفل، بدون وابستگی به ما و بدون هزینه‌ی پنهان برای دسترسی به کد خودت.",
  },
  {
    q: "اگه بعد از تحویل مشکلی پیش بیاد چی؟",
    a: "۳۰ روز گارانتی رفع باگ فنی داری، کاملاً رایگان. بعد از اون هم مستقیم با همون تیمی که پروژه‌ت رو ساخته در ارتباطی، برای رفع مشکل یا توسعه‌ی بعدی.",
  },
  {
    q: "اگه ثبت‌نام یا پرداختی نکنم، همچنان می‌تونم مشاوره بگیرم؟",
    a: "بله، دقیقاً برای همینه. برای گرفتن مشاوره‌ی رایگان هیچ نیازی به ساخت حساب کاربری یا پرداخت نیست — فقط اسم و شماره‌ت رو بذار.",
  },
  {
    q: "کسب‌وکار کوچیک من هم به‌درد این تیم می‌خوره؟",
    a: "بله. نمونه‌کارهای‌مون از فروشگاه و کلینیک تا دفاتر و مراکز آموزشی رو شامل می‌شه — تو بخش نمونه‌کارها می‌تونی فیلتر کنی و پروژه‌های مشابه کسب‌وکار خودت رو ببینی.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="relative scroll-mt-[90px] overflow-hidden border-t border-ink/10 py-[100px]">
      <div className="relative z-[1] mx-auto max-w-container px-6">
        <Reveal className="mb-12 flex items-baseline gap-4">
          <span className="flex h-8 items-center rounded-full border border-ink/10 bg-surface px-3.5 font-mono text-sm font-bold text-ink">
            FAQ
          </span>
          <div>
            <h2 className="font-display text-[28px] font-normal sm:text-[34px] lg:text-[40px]">
              سوالات پرتکرار
            </h2>
            <p className="mt-2.5 max-w-[62ch] text-[15px] text-dim">
              اگه سوال دیگه‌ای داشتی هم می‌تونی مستقیم تو واتساپ یا فرم پایین بپرسی.
            </p>
          </div>
        </Reveal>

        <div className="mx-auto flex max-w-[760px] flex-col gap-3">
          {faqs.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <Reveal key={item.q} delay={i * 60} className="overflow-hidden rounded-card border border-ink/10 bg-surface/50">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-right text-[14.5px] font-bold text-ink sm:px-6 sm:py-5"
                >
                  {item.q}
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.2}
                    className={`h-[16px] w-[16px] flex-shrink-0 text-accent transition-transform duration-200 ${
                      isOpen ? "rotate-45" : ""
                    }`}
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </button>
                <div
                  className={`grid transition-all duration-200 ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-[13.5px] leading-relaxed text-dim sm:px-6">{item.a}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
