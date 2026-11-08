"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUp, Clock, Mail, MapPin, Phone } from "lucide-react";
import { FooterBackgroundGradient, TextHoverEffect } from "@/components/ui/hover-footer";

// همون لینک‌های هدر، برای بخش «دسترسی سریع» فوتر — یه‌جا نگه‌داشته می‌شن
// که اگه صفحه‌ای اضافه/کم شد، هم هدر هم فوتر با هم آپدیت بشن.
const quickLinks = [
  { href: "/", label: "خانه" },
  { href: "/portfolio", label: "نمونه‌کارها" },
  { href: "/#lead-form", label: "مشاوره رایگان" },
  { href: "/blog", label: "وبلاگ" },
  { href: "/about", label: "درباره ما" },
  { href: "/contact", label: "تماس با ما" },
];

// اطلاعات شرکت — فعلاً نمونه‌ان، با اطلاعات واقعی جایگزین کن.
const PHONE_DISPLAY = "09965745535";
const PHONE_HREF = "tel:+989965745535";
const EMAIL = "webpikaso@gmail.com";
const WORK_HOURS = "شنبه تا پنجشنبه، 10 تا 16";
const SHORT_ADDRESS = "استان البرز، کرج، اصفهانی ها، بلوار قدس، فاطمیه";
// لینک موقعیت روی نقشه‌ی نشان و بله رو اینجا جایگزین کن.
const NESHAN_MAP_LINK = "https://neshan.org";
const BALAD_MAP_LINK = "https://balad.ir/p/1gUvHjyBbJRwmm?preview=true#21.55/35.810534/51.00279";

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

// Layout from the "hover-footer" block (21st.dev): a rounded card with
// four columns (brand, links, contact, address), a divider, socials and
// copyright, then a large outlined wordmark that lights up under the
// cursor (desktop only), over a soft blood-red gradient.
export default function Footer() {
  return (
    <footer className="relative m-3 h-fit overflow-hidden rounded-3xl border border-ink/10 bg-surface/40 sm:m-6 lg:m-8">
      <div className="relative z-40 mx-auto max-w-7xl px-6 pb-6 pt-10 sm:p-10 lg:p-14">
        <div className="grid grid-cols-2 gap-x-6 gap-y-9 pb-10 md:gap-8 lg:grid-cols-[1.3fr_0.9fr_1fr_1.2fr] lg:gap-14">
          {/* برند + توضیح کوتاه */}
          <div className="col-span-2 flex flex-col gap-4 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2.5 font-mono text-[20px] font-black text-ink sm:text-[24px]">
              <span className="relative flex h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg border border-blood-hi/40">
                <Image src="/logo.webp" alt="وب پیکاسو" fill sizes="40px" className="object-cover" />
              </span>
              <span className="leading-none">
                WebPIKASO<span className="text-blood-hi">.</span>
              </span>
            </Link>
            <p className="max-w-[36ch] text-[14px] leading-relaxed text-dim">
              طراحی و توسعه‌ی وب‌سایت‌های حرفه‌ای، فروشگاهی و اختصاصی — از ایده تا اجرا، کنار کسب‌وکار شما.
            </p>
          </div>

          {/* دسترسی سریع */}
          <div>
            <h4 className="mb-5 text-[16px] font-bold text-ink">دسترسی سریع</h4>
            <ul className="space-y-3">
              {quickLinks.map((l) => (
                <li key={l.href} className="relative w-fit">
                  <Link href={l.href} className="text-[14px] text-dim transition-colors hover:text-blood-hi">
                    {l.label}
                  </Link>
                  {l.href === "/#lead-form" && (
                    <span className="absolute -left-3 top-0 h-2 w-2 animate-pulse rounded-full bg-blood-hi" />
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* تماس */}
          <div>
            <h4 className="mb-5 text-[16px] font-bold text-ink">تماس با ما</h4>
            <ul className="space-y-4 text-[14px] text-dim">
              <li className="flex items-center gap-3">
                <Phone size={18} className="flex-shrink-0 text-blood-hi" />
                <Link href={PHONE_HREF} dir="ltr" className="transition-colors hover:text-blood-hi">
                  {PHONE_DISPLAY}
                </Link>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="flex-shrink-0 text-blood-hi" />
                <Link href={`mailto:${EMAIL}`} className="truncate transition-colors hover:text-blood-hi">
                  {EMAIL}
                </Link>
              </li>
              <li className="flex items-center gap-3">
                <Clock size={18} className="flex-shrink-0 text-blood-hi" />
                <span>{WORK_HOURS}</span>
              </li>
            </ul>
          </div>

          {/* آدرس و نقشه */}
          <div className="col-span-2 lg:col-span-1">
            <h4 className="mb-5 text-[16px] font-bold text-ink">آدرس و موقعیت</h4>
            <p className="mb-4 flex items-start gap-3 text-[14px] leading-relaxed text-dim">
              <MapPin size={18} className="mt-0.5 flex-shrink-0 text-blood-hi" />
              <span>{SHORT_ADDRESS}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { href: NESHAN_MAP_LINK, label: "نشان" },
                { href: BALAD_MAP_LINK, label: "بلد" },
              ].map((m) => (
                <Link
                  key={m.label}
                  href={m.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-ink/[0.14] bg-canvas/40 px-4 py-2 text-[13px] font-semibold text-ink transition hover:-translate-y-0.5 hover:border-blood-hi/50 hover:text-blood-hi"
                >
                  <MapPin size={14} />
                  {m.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <hr className="my-6 border-t border-ink/10 sm:my-8" />

        <div className="flex flex-col items-center justify-between gap-4 text-[13px] text-dim md:flex-row">
          <div className="flex items-center gap-5">
            {socials.map((s) => (
              <Link
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="text-dim transition-colors hover:text-blood-hi"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} className="h-5 w-5">
                  {s.icon}
                </svg>
              </Link>
            ))}
            <button
              className="flex items-center gap-1.5 font-mono text-[12.5px] transition-colors hover:text-blood-hi"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              بازگشت به بالا
              <ArrowUp size={14} />
            </button>
          </div>
          <p className="text-center">© {new Date().getFullYear().toLocaleString("fa-IR", { useGrouping: false })} وب پیکاسو — تمامی حقوق محفوظ است.</p>
        </div>
      </div>

      {/* wordmark that lights up under the cursor */}
      <div dir="ltr" className="-mb-20 -mt-24 hidden h-[24rem] lg:flex">
        <TextHoverEffect text="WebPikaso" className="z-50" />
      </div>

      <FooterBackgroundGradient />
    </footer>
  );
}
