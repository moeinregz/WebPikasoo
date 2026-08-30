"use client";

import Image from "next/image";
import Link from "next/link";

// همون لینک‌های هدر، برای بخش «دسترسی سریع» فوتر — یه‌جا نگه‌داشته می‌شن
// که اگه صفحه‌ای اضافه/کم شد، هم هدر هم فوتر با هم آپدیت بشن.
const quickLinks = [
  { href: "/", label: "خانه" },
  { href: "/portfolio", label: "نمونه‌کارها" },
  { href: "/order", label: "ثبت سفارش" },
  { href: "/blog", label: "وبلاگ" },
  { href: "/about", label: "درباره ما" },
  { href: "/contact", label: "تماس با ما" },
];

// اطلاعات شرکت — فعلاً نمونه‌ان، با اطلاعات واقعی جایگزین کن.
const PHONE_DISPLAY = "۰۹۹۶۵ ۷۴۵۵۳۵";
const PHONE_HREF = "tel:+989965745535";
const EMAIL = "info@webpikaso.com";
const WORK_HOURS = "شنبه تا پنجشنبه، ۹ تا ۱۸";
const SHORT_ADDRESS = "آدرس دقیق شرکت رو اینجا جایگزین کن";
// لینک موقعیت روی نقشه‌ی نشان و بله رو اینجا جایگزین کن.
const NESHAN_MAP_LINK = "https://neshan.org";
const BALAD_MAP_LINK = "https://balad.ir";

const socials = [
  {
    href: "https://wa.me/989965745535",
    label: "واتساپ",
    icon: (
      <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />
    ),
  },
  {
    href: "https://t.me/WebPikaso",
    label: "تلگرام",
    icon: (
      <>
        <path d="M22 2 11 13" />
        <path d="M22 2 15 22l-4-9-9-4 20-7Z" />
      </>
    ),
  },
  {
    href: "https://instagram.com/regzly",
    label: "اینستاگرام",
    icon: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" />
      </>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-ink/10 bg-surface/30">
      {/* بلوب‌های محو پس‌زمینه — هم‌خانواده با بقیه‌ی سکشن‌های سایت، تا فوتر
          هم مثل بقیه‌ی صفحه یه ذره جلوه داشته باشه و کاملاً تخت نباشه. */}
      <span
        className="pointer-events-none absolute -top-24 right-[-120px] h-72 w-72 rounded-full opacity-[0.16] blur-[110px]"
        style={{ background: "#0077B6" }}
      />
      <span
        className="pointer-events-none absolute bottom-[-160px] left-[-100px] h-80 w-80 rounded-full opacity-[0.14] blur-[130px]"
        style={{ background: "#00B4D8" }}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-accent/50 to-transparent" />

      <div className="relative z-[1] mx-auto max-w-container px-6 pb-5 pt-9 sm:pb-8 sm:pt-16">
        <div className="grid grid-cols-2 gap-x-6 gap-y-7 sm:gap-10 lg:grid-cols-[1.3fr_0.9fr_1fr_1.2fr]">
          {/* برند + توضیح کوتاه + شبکه‌های اجتماعی */}
          <div>
            <a href="/" className="inline-flex items-center gap-2 font-mono text-[16px] font-black text-ink sm:gap-2.5 sm:text-[18px]">
              <span className="relative flex h-8 w-8 flex-shrink-0 overflow-hidden rounded-full shadow-glow sm:h-10 sm:w-10">
                <Image src="/logo.jpg" alt="وب پیکاسو" fill sizes="40px" className="object-cover" />
              </span>
              <span className="leading-none">
                WebPIKASO<span className="text-accent">.</span>
              </span>
            </a>
            <p className="mt-4 hidden max-w-[34ch] text-[14px] leading-relaxed text-dim sm:block">
              طراحی و توسعه‌ی وب‌سایت‌های حرفه‌ای، فروشگاهی و اختصاصی — از ایده تا اجرا، کنار کسب‌وکار شما.
            </p>
            <div className="mt-3 flex items-center gap-2 sm:mt-5 sm:gap-2.5">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-ink/[0.14] text-dim transition hover:-translate-y-0.5 hover:border-accent/40 hover:text-accent sm:h-9 sm:w-9"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} className="h-3.5 w-3.5 sm:h-4 sm:w-4">
                    {s.icon}
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* دسترسی سریع */}
          <div>
            <h3 className="mb-2.5 text-[13.5px] font-bold text-ink sm:mb-4 sm:text-[15px]">دسترسی سریع</h3>
            <ul className="flex flex-col gap-1.5 sm:gap-2.5">
              {quickLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[13px] text-dim transition hover:text-accent sm:text-[14px]">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* اطلاعات شرکت */}
          <div>
            <h3 className="mb-2.5 text-[13.5px] font-bold text-ink sm:mb-4 sm:text-[15px]">اطلاعات شرکت</h3>
            <ul className="flex flex-col gap-2 text-[13px] text-dim sm:gap-3 sm:text-[14px]">
              <li className="flex items-center gap-2 sm:gap-2.5">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent sm:h-8 sm:w-8">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} className="h-3 w-3 sm:h-4 sm:w-4">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.68 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.32 1.85.55 2.81.68A2 2 0 0 1 22 16.92Z" />
                  </svg>
                </span>
                <a href={PHONE_HREF} dir="ltr" className="text-right transition hover:text-accent">
                  {PHONE_DISPLAY}
                </a>
              </li>
              <li className="flex items-center gap-2 sm:gap-2.5">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent sm:h-8 sm:w-8">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} className="h-3 w-3 sm:h-4 sm:w-4">
                    <rect x="3" y="5" width="18" height="14" rx="2.5" />
                    <path d="m4 6.5 8 6 8-6" />
                  </svg>
                </span>
                <a href={`mailto:${EMAIL}`} className="truncate transition hover:text-accent">
                  {EMAIL}
                </a>
              </li>
              <li className="hidden items-center gap-2.5 sm:flex">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} className="h-4 w-4">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 8v4l2.5 2.5" />
                  </svg>
                </span>
                <span>{WORK_HOURS}</span>
              </li>
            </ul>
          </div>

          {/* آدرس و نقشه */}
          <div>
            <h3 className="mb-2.5 text-[13.5px] font-bold text-ink sm:mb-4 sm:text-[15px]">آدرس و موقعیت</h3>
            <p className="mb-3 flex items-start gap-2 text-[13px] leading-relaxed text-dim sm:mb-4 sm:gap-2.5 sm:text-[14px]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.7}
                className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-accent sm:h-4 sm:w-4"
              >
                <path d="M12 21s-7-6.2-7-11.2a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" />
                <circle cx="12" cy="9.8" r="2.4" />
              </svg>
              <span>{SHORT_ADDRESS}</span>
            </p>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              <a
                href={NESHAN_MAP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-ink/[0.14] bg-surface/60 px-3 py-1.5 text-[12px] font-semibold text-ink transition hover:-translate-y-0.5 hover:border-accent/40 hover:text-accent sm:px-4 sm:py-2 sm:text-[13px]"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-3 w-3 sm:h-3.5 sm:w-3.5">
                  <path d="M12 21s-7-6.2-7-11.2a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" />
                  <circle cx="12" cy="9.8" r="2.4" />
                </svg>
                نشان
              </a>
              <a
                href={BALAD_MAP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-ink/[0.14] bg-surface/60 px-3 py-1.5 text-[12px] font-semibold text-ink transition hover:-translate-y-0.5 hover:border-accent/40 hover:text-accent sm:px-4 sm:py-2 sm:text-[13px]"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-3 w-3 sm:h-3.5 sm:w-3.5">
                  <path d="M12 21s-7-6.2-7-11.2a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" />
                  <circle cx="12" cy="9.8" r="2.4" />
                </svg>
                بله
              </a>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-2.5 border-t border-ink/10 pt-4 sm:mt-14 sm:gap-3 sm:pt-6">
          <p className="font-mono text-[11.5px] text-dim sm:text-[13px]">© 2026 وب پیکاسو — تمامی حقوق محفوظ است.</p>
          <button
            className="flex items-center gap-2 font-mono text-[11.5px] text-dim transition-colors hover:text-accent sm:text-[13px]"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            بازگشت به بالا
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </button>
        </div>
      </div>
    </footer>
  );
}
