import type { ReactNode } from "react";
import Reveal from "./Reveal";

/** بنر کوچیک بالای صفحه‌های مستقل (تماس، خدمات، ثبت سفارش) — همون حس
 *  بخش‌های هدر صفحه‌ی اصلی (بج mono + تیتر display + توضیح) رو برای
 *  صفحه‌ای که خودش یه section جدا و کامله بازتولید می‌کنه. */
export default function PageHero({
  eyebrow,
  title,
  desc,
  children,
}: {
  eyebrow: string;
  title: string;
  desc: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-ink/10 pb-16 pt-[68px] sm:pb-20 sm:pt-[76px]">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[420px] bg-dot-grid" />
      <span
        className="pointer-events-none absolute -right-[180px] -top-[220px] z-0 h-[560px] w-[560px] rounded-full opacity-40 blur-[130px]"
        style={{ background: "rgba(0, 119, 182, .35)" }}
      />
      <span
        className="pointer-events-none absolute -left-[200px] -bottom-[240px] z-0 h-[480px] w-[480px] rounded-full opacity-30 blur-[130px]"
        style={{ background: "rgba(2, 62, 138, .35)" }}
      />

      <div className="relative z-[1] mx-auto max-w-container px-6 pt-14 text-center sm:pt-16">
        <Reveal>
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-ink/10 bg-surface px-3.5 py-1.5 font-mono text-[12.5px] font-bold text-ink">
            <span className="h-1.5 w-1.5 flex-shrink-0 animate-pulse-dot rounded-full bg-accent3" />
            {eyebrow}
          </span>
          <h1 className="mx-auto max-w-[18ch] font-display text-[36px] font-normal leading-[1.3] sm:text-[48px] lg:text-[58px]">
            {title}
          </h1>
          <p className="mx-auto mt-5 max-w-[56ch] text-[15.5px] leading-relaxed text-dim sm:text-base">
            {desc}
          </p>
        </Reveal>
        {children && <Reveal delay={80}>{children}</Reveal>}
      </div>
    </section>
  );
}
