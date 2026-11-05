import type { ReactNode } from "react";
import BrandMark from "./BrandMark";
import Reveal from "./Reveal";
import ContactForm from "./ContactForm";
import { getCurrentUser } from "@/lib/session";

type SocialLink = {
  href: string;
  label: string;
  value: string;
  icon: ReactNode;
};

const socials: SocialLink[] = [
  {
    href: "https://instagram.com/regzly",
    label: "اینستاگرام",
    value: "regzly@",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-[22px] w-[22px] text-ink transition-colors group-hover:text-accent">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" />
      </svg>
    ),
  },
  {
    href: "https://t.me/WebPikaso",
    label: "تلگرام",
    value: "WebPikaso@",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-[22px] w-[22px] text-ink transition-colors group-hover:text-accent">
        <path d="M22 2 11 13" />
        <path d="M22 2 15 22l-4-9-9-4 20-7Z" />
      </svg>
    ),
  },
  {
    href: "https://wa.me/989965745535",
    label: "واتساپ",
    value: "چت کن",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-[22px] w-[22px] text-ink transition-colors group-hover:text-accent">
        <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />
      </svg>
    ),
  },
  {
    href: "tel:+989965745535",
    label: "تماس",
    value: "5535 574 0996",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-[22px] w-[22px] text-ink transition-colors group-hover:text-accent">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.68 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.32 1.85.55 2.81.68A2 2 0 0 1 22 16.92Z" />
      </svg>
    ),
  },
];

export default async function Contact() {
  const user = await getCurrentUser();

  return (
    <section id="contact" className="relative scroll-mt-[90px] overflow-hidden border-t border-ink/10 py-[100px] pt-[120px] text-center">

      <div className="relative z-[1] mx-auto max-w-container px-6">
        {/* CTA نهایی — همون آسمون لوندر و سکه‌ی مشکی هیرو، به‌عنوان «بسته‌شدن» داستان صفحه */}
        <div data-gsap="zoom" className="theme-sky relative isolate overflow-hidden rounded-[36px] px-6 pb-16 pt-14 text-[#010102] shadow-[0_50px_120px_-50px_rgb(173_150_241/0.8)] sm:px-10">
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <div className="sky-hero__base absolute inset-0" />
            <span className="sky-aurora left-[-10%] top-[20%] h-[70%] w-[45%] bg-[#ff8ad8]" />
            <span className="sky-aurora right-[-8%] top-[5%] h-[60%] w-[40%] bg-[#7fe3ff] [animation-delay:-7s]" />
            <div className="sky-cloud left-[-4%] top-[4%] h-[30%] w-[40%] opacity-80">
              <span style={{ left: "0%", top: "30%", width: "34%", aspectRatio: "1" }} />
              <span style={{ left: "20%", top: "10%", width: "38%", aspectRatio: "1" }} />
              <span style={{ left: "46%", top: "28%", width: "32%", aspectRatio: "1" }} />
            </div>
            <div className="sky-cloud right-[-4%] bottom-[6%] h-[30%] w-[44%] opacity-70 [animation-delay:-12s]">
              <span style={{ left: "4%", top: "30%", width: "32%", aspectRatio: "1" }} />
              <span style={{ left: "28%", top: "12%", width: "38%", aspectRatio: "1" }} />
              <span style={{ left: "56%", top: "30%", width: "30%", aspectRatio: "1" }} />
            </div>
          </div>
          <div className="sky-coin-stage mx-auto mb-12 !w-[120px]">
            <span className="sky-coin__halo" />
            <div className="sky-coin-wrap">
              <div className="sky-coin">
                <span className="sky-coin__edge" />
                <span className="sky-coin__face">
                  <BrandMark className="sky-coin__logo" idSuffix="cta" />
                  <span className="sky-coin__shine" />
                </span>
              </div>
              <span className="sky-coin__shadow" />
            </div>
          </div>
          <span className="mb-[22px] inline-flex items-center gap-2 rounded-md border border-[#010102]/15 bg-white/55 px-3.5 py-1.5 text-[12.5px] font-bold text-[#010102]">
            <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-[#7C5CE6]" />
            آماده‌ی همکاری روی پروژه‌های جدید
          </span>
          <h2 className="mx-auto mb-5 max-w-[16ch] font-display text-[34px] leading-[1.3] sm:text-[46px] lg:text-[60px]">
            بیا یه چیز خفن با هم بسازیم.
          </h2>
          <p className="mx-auto mb-3 max-w-[48ch] text-base text-[#1A1033]/75">
            برای پنل مدیریت، فروشگاه آنلاین، یا هر ایده‌ای که تو سرته، پیام بده — سریع جواب می‌دیم.
          </p>
          <p className="mx-auto mb-10 text-[12.5px] text-white/85">بدون تعهد، بدون هزینه</p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="https://wa.me/989965745535"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-black text-[#010102] shadow-[0_14px_40px_-12px_rgba(26,16,51,0.55)] transition hover:-translate-y-0.5"
            >
              شروع گفتگو در واتساپ
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-[15px] w-[15px]">
                <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />
              </svg>
            </a>
            <a
              href="tel:+989965745535"
              className="inline-flex items-center gap-2 rounded-full bg-[#010102] px-8 py-4 text-base font-black text-white transition hover:-translate-y-0.5 hover:bg-[#1A1033]"
            >
              تماس مستقیم
            </a>
          </div>
        </div>

        <Reveal
          id="lead-form"
          className="mx-auto mt-14 max-w-[720px] scroll-mt-[90px] matte rounded-card p-6 text-right sm:p-9"
        >
          <h3 className="mb-2 font-display text-2xl font-normal">
            یا مشاوره‌ی رایگان پروژه‌ت رو رزرو کن
          </h3>
          <p className="mb-7 text-sm text-dim">
            بدون تعهد، بدون نیاز به ثبت‌نام — فقط اسمت، شماره‌ت و یه توضیح کوتاه؛ بقیه رو تو تماس می‌پرسیم.
          </p>
          <ContactForm defaultName={user?.name} defaultPhone={user?.phone} />
        </Reveal>

        <Reveal className="mx-auto my-16 flex max-w-[420px] items-center gap-4 font-mono text-xs font-bold text-dim before:h-px before:flex-1 before:bg-ink/10 before:content-[''] after:h-px after:flex-1 after:bg-ink/10 after:content-['']">
          یا از این راه‌ها پیدامون کن
        </Reveal>

        <Reveal className="grid grid-cols-2 gap-3.5 md:grid-cols-4">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target={s.href.startsWith("http") ? "_blank" : undefined}
              rel={s.href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="group flex flex-col items-center justify-center gap-2.5 matte matte-sm matte-hover rounded-[14px] px-3 py-[22px] font-mono text-[12.5px] text-dim transition hover:-translate-y-1 hover:border-ink/20"
            >
              {s.icon}
              <span className="font-fa text-[13.5px] font-semibold text-ink">{s.label}</span>
              {s.value}
            </a>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
