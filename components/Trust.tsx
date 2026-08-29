import type { ReactNode } from "react";
import Reveal from "./Reveal";
import StatCounter from "./StatCounter";
import { businessSites, categories } from "@/lib/businessSites";

type TrustPoint = { title: string; desc: string; icon: ReactNode };

const trustPoints: TrustPoint[] = [
  {
    title: "سایت واقعاً مال خودته",
    desc: "سورس کامل پروژه رو تحویل می‌گیری؛ بدون قفل، محدودیت یا وابستگی به ما.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <path d="M9 6 3 12l6 6M15 6l6 6-6 6" />
      </svg>
    ),
  },
  {
    title: "مستقیم با تیم سازنده",
    desc: "هر زمان نیاز داشته باشی، مستقیم با تیمی در ارتباطی که پروژه‌ت رو ساخته.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <path d="M21 11.5a8.5 8.5 0 0 1-11.9 7.8L3 21l1.7-6.1A8.5 8.5 0 1 1 21 11.5Z" />
      </svg>
    ),
  },
  {
    title: "همه‌چیز از اول مشخصه",
    desc: "قیمت، امکانات و زمان تحویل قبل از شروع کاملاً مشخص می‌شن؛ بدون هزینه پنهان.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3.5 2" />
      </svg>
    ),
  },
  {
    title: "بعد از تحویل تنها نیستی",
    desc: "اگر پروژه باگ فنی داشته باشه، طبق گارانتی بدون هزینه برات رفعش می‌کنیم.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <path d="M12 3 4.5 6.5v5c0 4.6 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.9 7.5-9.5v-5L12 3Z" />
        <path d="m8.5 12.3 2.4 2.4 4.6-4.9" />
      </svg>
    ),
  },
];

export default function Trust() {
  return (
    <section id="trust" className="relative scroll-mt-[90px] overflow-hidden border-t border-ink/10 py-[110px]">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[480px] bg-dot-grid" />
      <span
        className="pointer-events-none absolute -left-[200px] -top-[220px] z-0 h-[560px] w-[560px] rounded-full opacity-40 blur-[130px]"
        style={{ background: "rgba(0, 119, 182, .3)" }}
      />

      <div className="relative z-[1] mx-auto max-w-container px-6">
        <Reveal className="mb-12 flex items-baseline gap-4">
          <span className="flex h-8 items-center rounded-full border border-ink/10 bg-surface px-3.5 font-mono text-sm font-bold text-ink">
            About
          </span>
          <div>
            <h2 className="font-display text-[28px] font-normal sm:text-[34px] lg:text-[40px]">
              چرا کسب‌وکارت رو به وب پیکاسو بسپاری؟
            </h2>
            <p className="mt-2.5 max-w-[62ch] text-[15px] text-dim">
              یه تیم کوچیک و متخصصیم، نه یه آژانس بزرگ با هزار واسطه — یعنی هم سریع‌تر جواب می‌گیری،
              هم دقیقاً می‌دونی پروژه‌ت دست کیه.
            </p>
          </div>
        </Reveal>

        {/* پنل تیره‌ی آماری — همون حس ترمینال هیرو و پنل سئوی بخش مهارت‌ها */}
        <Reveal className="mb-8 overflow-hidden rounded-card border border-white/10 bg-black/40 p-6 backdrop-blur-xl sm:p-9">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-4">
            <div>
              <div className="font-display text-[26px] font-normal text-white sm:text-[32px]">
                <StatCounter to={10} suffix=" نفر" />
              </div>
              <div className="mt-1 font-mono text-[10.5px] leading-relaxed text-white/45 sm:text-[11px]">
                تیم متخصص و کوچیک
              </div>
            </div>
            <div>
              <div className="font-display text-[26px] font-normal text-white sm:text-[32px]">
                <StatCounter to={categories.length} />
              </div>
              <div className="mt-1 font-mono text-[10.5px] leading-relaxed text-white/45 sm:text-[11px]">
                صنف و حوزه‌ی کاری مختلف
              </div>
            </div>
            <div>
              <div className="font-display text-[26px] font-normal text-white sm:text-[32px]">
                <StatCounter to={businessSites.length} suffix="+" />
              </div>
              <div className="mt-1 font-mono text-[10.5px] leading-relaxed text-white/45 sm:text-[11px]">
                نمونه‌سایت طراحی‌شده
              </div>
            </div>
            <div>
              <div className="font-display text-[26px] font-normal text-white sm:text-[32px]">
                <StatCounter to={30} suffix=" روز" />
              </div>
              <div className="mt-1 font-mono text-[10.5px] leading-relaxed text-white/45 sm:text-[11px]">
                گارانتی رفع باگ
              </div>
            </div>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {trustPoints.map((p) => (
            <Reveal
              key={p.title}
              className="flex items-start gap-4 rounded-card border border-ink/10 bg-surface/50 p-5 sm:p-6"
            >
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[10px] bg-accent p-2.5 text-white">
                {p.icon}
              </span>
              <div className="min-w-0 flex-1">
                <h4 className="mb-1.5 text-[15.5px] font-bold">{p.title}</h4>
                <p className="text-[13.5px] text-dim">{p.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
