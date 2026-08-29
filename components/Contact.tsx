import type { ReactNode } from "react";
import Link from "next/link";
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
      <span
        className="pointer-events-none absolute -right-[160px] -bottom-[280px] z-0 h-[600px] w-[600px] rounded-full opacity-35 blur-[130px]"
        style={{ background: "rgba(0, 119, 182, .35)" }}
      />

      <div className="relative z-[1] mx-auto max-w-container px-6">
        <Reveal className="relative isolate overflow-hidden rounded-[24px] border border-ink/10 bg-[#0a0a0c] px-6 py-16 text-white sm:px-10">
          {/* Ambient animated gradient mesh — the Vercel "deploy" CTA-panel
              treatment: a soft drifting blob of brand-gradient behind the
              copy, contained inside the panel only. */}
          <span
            className="absolute -inset-x-[10%] -inset-y-[30%] -z-10 animate-pulse-soft blur-[60px]"
            style={{ background: "rgba(0, 119, 182, .28)" }}
          />
          <span className="mb-[22px] inline-flex items-center gap-2 rounded-full border border-white/[0.14] px-3.5 py-1.5 font-mono text-[12.5px] text-white/70">
            <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-accent3" />
            آماده‌ی همکاری روی پروژه‌های جدید
          </span>
          <h2 className="mx-auto mb-5 max-w-[16ch] font-display text-[32px] font-normal leading-[1.35] sm:text-[42px] lg:text-[58px]">
            بیا یه چیز خفن با هم بسازیم.
          </h2>
          <p className="mx-auto mb-10 max-w-[48ch] text-base text-white/60">
            برای پنل مدیریت، فروشگاه آنلاین، یا هر ایده‌ای که تو سرته، پیام بده — سریع جواب می‌دیم.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://wa.me/989965745535"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-[34px] py-[17px] text-base font-semibold text-white shadow-glow transition hover:-translate-y-0.5"
            >
              شروع گفتگو در واتساپ
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-[15px] w-[15px]">
                <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />
              </svg>
            </a>
            <a
              href="tel:+989965745535"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 px-[34px] py-[17px] text-base font-semibold text-white transition hover:border-accent hover:text-accent"
            >
              تماس مستقیم
            </a>
          </div>
        </Reveal>

        <Reveal className="mx-auto mt-14 max-w-[720px] rounded-card border border-ink/10 bg-surface/50 p-6 text-right sm:p-9">
          <h3 className="mb-2 font-display text-2xl font-normal">
            یا فرم درخواست پروژه رو پر کن
          </h3>
          <p className="mb-7 text-sm text-dim">
            هرچی دقیق‌تر بنویسی، سریع‌تر می‌تونیم یه جواب درست بهت بدیم.
          </p>
          {user ? (
            <ContactForm defaultName={user.name} defaultPhone={user.phone} />
          ) : (
            <div className="flex flex-col items-start gap-4 rounded-[14px] border border-dashed border-ink/[0.2] bg-surface/40 p-6 text-right sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-ink">
                  برای ثبت درخواست پروژه اول باید وارد حساب کاربریت بشی.
                </p>
                <p className="mt-1 text-sm text-dim">
                  یه حساب بساز یا وارد شو — چند ثانیه‌ای تمومه، بعدش می‌تونی درخواستت رو بفرستی و پیگیرش باشی.
                </p>
              </div>
              <Link
                href="/account"
                className="inline-flex w-full flex-shrink-0 items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 text-[14.5px] font-bold text-canvas transition hover:-translate-y-0.5 sm:w-auto"
              >
                ورود / ثبت‌نام
              </Link>
            </div>
          )}
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
              className="group flex flex-col items-center justify-center gap-2.5 rounded-[14px] border border-ink/10 bg-surface/40 px-3 py-[22px] font-mono text-[12.5px] text-dim transition hover:-translate-y-1 hover:border-ink/20"
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
