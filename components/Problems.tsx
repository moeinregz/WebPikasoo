import type { ReactNode } from "react";
import Reveal from "./Reveal";

type ProblemSolution = {
  problem: string;
  solution: string;
  icon: ReactNode;
  color: string;
};

/** بخش «چه مشکلی داری؟» — قبل از حرف زدن درباره‌ی خدمات، اول مشکلی که
 *  بازدیدکننده باهاش اومده رو تو کلمات خودش نشون می‌دیم و کنارش راه‌حل
 *  رو می‌ذاریم. این ترتیب (مشکل → راه‌حل) کمک می‌کنه بازدیدکننده حس کنه
 *  «اینا دقیقاً می‌دونن چی می‌خوام»، قبل از این‌که وارد جزئیات خدمات بشه. */
const items: ProblemSolution[] = [
  {
    problem: "سایت دارم ولی هیچ مشتری‌ای ازش نمیاد.",
    solution: "سایت رو بر اساس اصول تبدیل بازدیدکننده به مشتری بازطراحی می‌کنیم، نه فقط ظاهرش.",
    color: "#0077B6",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
    ),
  },
  {
    problem: "قبلاً با یه فریلنسر/تیم دیگه سوخته‌ام.",
    solution: "از اول قیمت، زمان تحویل و امکانات رو مکتوب می‌دیم و مرحله‌به‌مرحله تاییدت رو می‌گیریم.",
    color: "#00B4D8",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <path d="M12 3 4.5 6.5v5c0 4.6 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.9 7.5-9.5v-5L12 3Z" />
        <path d="M9.5 12.3 12 3M9.5 12.3l2.5 2.4 4.6-4.9" />
      </svg>
    ),
  },
  {
    problem: "نمی‌دونم دقیقاً چه نوع سایت/سیستمی نیاز دارم.",
    solution: "تو یه گفتگوی کوتاه و رایگان نیازت رو تحلیل می‌کنیم و بهترین مسیر رو پیشنهاد می‌دیم.",
    color: "#023E8A",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9.2a2.5 2.5 0 0 1 4.9.8c0 1.7-2.4 1.7-2.4 3.3" />
        <path d="M12 17h.01" />
      </svg>
    ),
  },
  {
    problem: "می‌ترسم بعد از تحویل تنها بمونم و کسی جواب نده.",
    solution: "بعد از تحویل هم مستقیم با همون تیمی که ساخته‌ت در ارتباطی؛ گارانتی رفع باگ هم داری.",
    color: "#48CAE4",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <path d="M21 11.5a8.5 8.5 0 0 1-11.9 7.8L3 21l1.7-6.1A8.5 8.5 0 1 1 21 11.5Z" />
      </svg>
    ),
  },
];

export default function Problems() {
  return (
    <section
      id="problems"
      className="relative scroll-mt-[90px] overflow-hidden border-t border-ink/10 py-[100px]"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[420px] bg-dot-grid" />

      <div className="relative z-[1] mx-auto max-w-container px-6">
        <Reveal className="mb-12 flex items-baseline gap-4">
          <span className="flex h-8 items-center rounded-full border border-ink/10 bg-surface px-3.5 font-mono text-sm font-bold text-ink">
            Problems
          </span>
          <div>
            <h2 className="font-display text-[28px] font-normal sm:text-[34px] lg:text-[40px]">
              چه مشکلی داری؟
            </h2>
            <p className="mt-2.5 max-w-[62ch] text-[15px] text-dim">
              احتمالاً یکی از این‌هاست — و راه‌حلش هم دقیقاً روبه‌روشه.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {items.map((it, i) => (
            <Reveal
              key={it.problem}
              delay={i * 80}
              className="flex flex-col gap-4 rounded-card border border-ink/10 bg-surface/50 p-5 sm:p-6"
            >
              <div className="flex items-start gap-4">
                <span
                  className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[10px] p-2.5"
                  style={{ background: `${it.color}22`, color: it.color }}
                >
                  {it.icon}
                </span>
                <p className="pt-1.5 text-[14.5px] font-bold leading-relaxed text-ink">{it.problem}</p>
              </div>
              <div className="mr-[3.6rem] flex items-start gap-2.5 border-t border-ink/10 pt-4">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={it.color}
                  strokeWidth={2.5}
                  className="mt-0.5 h-4 w-4 flex-shrink-0"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                <p className="text-[13.5px] leading-relaxed text-dim">{it.solution}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* گزینه‌ی «نمی‌دانم چه راهکاری نیاز دارم» — دقیقاً روی همون فرم
            درخواست مشاوره باز می‌شه، با نوع پروژه از قبل انتخاب‌شده. */}
        <Reveal className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-card border border-dashed border-ink/[0.2] bg-surface/40 p-6">
          <div>
            <h4 className="text-[15.5px] font-bold">هیچ‌کدوم از این‌ها نبود، یا نمی‌دونی دقیقاً چی لازم داری؟</h4>
            <p className="mt-1.5 text-[13.5px] text-dim">اشکالی نداره — تو یه گفتگوی کوتاه با هم می‌فهمیم.</p>
          </div>
          <a
            href="#lead-form"
            className="inline-flex flex-shrink-0 items-center gap-2 rounded-full bg-accent px-5 py-3 text-[14px] font-bold text-white shadow-glow transition hover:-translate-y-0.5"
          >
            نمی‌دانم چه راهکاری نیاز دارم
          </a>
        </Reveal>
      </div>
    </section>
  );
}
