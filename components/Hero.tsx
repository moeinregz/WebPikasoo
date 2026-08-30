import Reveal from "./Reveal";
import HeroSlider from "./HeroSlider";

export default function Hero() {
  return (
    <section className="relative overflow-hidden pb-[100px] pt-20">
      {/* Faint dotted grid backdrop — the Vercel/GitHub marketing-hero
          texture — plus two soft neon glow blobs drifting slowly. */}
      <div className="pointer-events-none absolute inset-0 z-0 h-[640px] bg-dot-grid" />
      <span
        className="pointer-events-none absolute -right-[220px] -top-[220px] z-0 h-[560px] w-[560px] animate-float-glow rounded-full opacity-60 blur-[130px]"
        style={{ background: "rgba(0, 119, 182, .4)" }}
      />
      <span
        className="pointer-events-none absolute -left-[240px] top-[60px] z-0 h-[520px] w-[520px] animate-float-glow-slow rounded-full opacity-50 blur-[130px]"
        style={{ background: "rgba(2, 62, 138, .35)" }}
      />

      <div className="relative z-10 mx-auto mt-14 grid max-w-container grid-cols-1 gap-14 px-6 md:grid-cols-[1.05fr_.95fr] md:items-center">
        <div>
          <Reveal>
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-ink/10 bg-surface/70 px-3.5 py-1.5 font-mono text-[12.5px] font-semibold text-ink">
              <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-accent3" />
              آماده‌ی همکاری روی پروژه‌های جدید
            </span>
          </Reveal>

          <Reveal delay={110}>
            <h1 className="mb-5 font-display text-[40px] font-normal leading-[1.28] sm:text-[52px] lg:text-[60px]">
              ما نرم‌افزار نمی‌سازیم؛
              <br />
              <span className="relative inline-block whitespace-nowrap accent-gradient-text">
                ابزار پول‌سازی
                <svg
                  viewBox="0 0 300 18"
                  preserveAspectRatio="none"
                  className="absolute inset-x-0 -bottom-2 h-[10px] w-full text-accent2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={7}
                  strokeLinecap="round"
                >
                  <path d="M4 9c60-8 220-8 292 0" />
                </svg>
              </span>{" "}
              می‌سازیم.
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mb-8 max-w-[52ch] text-[15.5px] text-dim sm:text-[18px]">
               وب پیکاسو؛ یه تیم 10 نفره‌ی توسعه‌ی نرم‌افزار. با توسعه {" "}
              <b className="font-semibold text-ink"> پنل های مدیریت،
              فروشگاه آنلاین ، سیستم فاکتوردهی و نرم افزار های مختلف</b>  — چیزی که واقعاً تو کسب‌وکارت اجرا می‌شه، نه
              فقط تو دمو خوب به‌نظر می‌رسه.
            </p>
          </Reveal>

<Reveal delay={210}>
  <div className="my-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
    {[
  { t: "بدون هزینه پنهان", d: "همه‌چیز شفاف از ابتدا" },
  { t: "سایت نتیجه‌محور", d: "سریع، حرفه‌ای و قابل رشد" },
  { t: "پشتیبانی واقعی", d: "بعد از تحویل تنها نیستید" },
].map((f) => (
      <div
        key={f.t}
        className="rounded-[12px] border border-ink/10 bg-surface/60 p-4 transition-colors"
      >
        <span className="block text-sm font-bold leading-relaxed">
          {f.t}
        </span>
        <span className="block text-xs leading-relaxed text-dim">
          {f.d}
        </span>
      </div>
    ))}
  </div>
</Reveal>

          <Reveal delay={260}>
            <div className="flex flex-wrap gap-3.5">
              <a
                href="#showcase"
                className="inline-flex items-center gap-2 rounded-lg bg-ink px-6 py-3.5 text-[15px] font-bold text-canvas shadow-glow-soft transition hover:-translate-y-0.5"
              >
                مشاهده‌ی نمونه‌کارها
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-[15px] w-[15px]">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </a>
              <a
                href="/order"
                className="inline-flex items-center gap-2 rounded-lg border-2 border-ink/15 px-6 py-[13px] text-[15px] font-bold text-ink transition hover:border-accent hover:text-accent"
              >
                ثبت سفارش 
              </a>
            </div>
          </Reveal>
        </div>

        {/* اسلایدر نمونه‌کارها — جایگزین ترمینال قبلی؛ سه پروژه‌ی شاخص
            تیم رو با همون هویت بصری شیشه‌ی تیره نشون می‌ده. */}
        <div id="work" className="scroll-mt-[90px]">
          <Reveal delay={200}>
            <HeroSlider />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
