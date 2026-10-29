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
      <div className="aurora">
        <span className="-right-[180px] -top-[220px] h-[560px] w-[560px] animate-aurora bg-accent" />
        <span className="-left-[200px] -bottom-[240px] h-[480px] w-[480px] animate-aurora-slow bg-accent2" />
      </div>

      <div className="relative z-[1] mx-auto max-w-container px-6 pt-14 text-center sm:pt-16">
        <Reveal>
          <span className="eyebrow mb-6">
            <span className="h-1.5 w-1.5 flex-shrink-0 animate-pulse-dot rounded-full bg-accent3" />
            {eyebrow}
          </span>
          <h1 className="mx-auto max-w-[18ch] font-display text-[40px] font-normal leading-[1.25] sm:text-[56px] lg:text-[70px]">
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
