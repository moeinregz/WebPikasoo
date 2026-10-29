import Reveal from "./Reveal";
import HeroSlider from "./HeroSlider";

const features = [
  { t: "بدون هزینه پنهان", d: "قیمت و امکانات از اول شفافه" },
  { t: "سایت نتیجه‌محور", d: "برای فروش و مشتری بیشتر، نه فقط ظاهر" },
  { t: "پشتیبانی واقعی", d: "بعد از تحویل هم تنها نیستی" },
];

/** هر کلمه تو یه span جدا، با تاخیر پله‌ای — تیتر کلمه‌به‌کلمه از پایین
 *  با یه بلور نرم بالا میاد. */
function Words({ text, start = 0, className = "" }: { text: string; start?: number; className?: string }) {
  return (
    <span className="word-reveal">
      {text.split(" ").map((w, i) => (
        <span key={i} style={{ animationDelay: `${start + i * 90}ms` }}>
          <span className={className}>{w}</span>
          {" "}
        </span>
      ))}
    </span>
  );
}

export default function Hero() {
  return (
    <section className="relative -mt-[72px] overflow-hidden pb-24 pt-[130px] md:-mt-[78px] md:pt-[150px] sm:pb-32">
      {/* پس‌زمینه: گرید نقطه‌ای + شفق متحرک + یه حلقه‌ی چرخان بزرگ */}
      <div className="pointer-events-none absolute inset-0 z-0 h-[760px] bg-dot-grid" />
      <div className="aurora">
        <span className="-right-[180px] -top-[200px] h-[620px] w-[620px] animate-aurora bg-accent" />
        <span className="-left-[220px] top-[80px] h-[540px] w-[540px] animate-aurora-slow bg-accent2" />
        <span className="left-[30%] top-[420px] h-[360px] w-[360px] animate-aurora bg-accent3 !opacity-30" />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[120px] z-0 h-[900px] w-[900px] -translate-x-1/2 animate-spin-slow rounded-full opacity-[0.07] [animation-duration:60s]"
        style={{ background: "conic-gradient(from 0deg, transparent, #00b4d8, transparent 30%, #0077b6, transparent 60%)" }}
      />

      <div className="relative z-10 mx-auto grid max-w-container grid-cols-1 gap-16 px-6 md:grid-cols-[1.1fr_.9fr] md:items-center">
        <div>
          <Reveal>
            <span className="eyebrow mb-7 !py-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-accent3 opacity-75" />
                <span className="relative h-2 w-2 rounded-full bg-accent3" />
              </span>
              آماده‌ی همکاری روی پروژه‌های جدید
            </span>
          </Reveal>

          <h1 className="mb-7 font-display text-[44px] font-normal leading-[1.22] tracking-tight sm:text-[60px] lg:text-[76px]">
            <Words text="ما نرم‌افزار نمی‌سازیم؛" />
            <br />
            <span className="relative inline-block whitespace-nowrap">
              <Words text="ابزار پول‌سازی" start={300} className="text-gradient" />
              <svg
                viewBox="0 0 300 18"
                preserveAspectRatio="none"
                className="absolute inset-x-0 -bottom-1 h-[12px] w-full"
                fill="none"
                strokeWidth={6}
                strokeLinecap="round"
              >
                <defs>
                  <linearGradient id="heroUnderline" x1="0" x2="1">
                    <stop offset="0" stopColor="#48CAE4" />
                    <stop offset="1" stopColor="#0077B6" />
                  </linearGradient>
                </defs>
                <path
                  d="M4 10c60-9 220-9 292 0"
                  stroke="url(#heroUnderline)"
                  pathLength={1}
                  strokeDasharray="1"
                  strokeDashoffset="1"
                  className="[animation:heroDraw_1s_.9s_cubic-bezier(.16,1,.3,1)_forwards] motion-reduce:[stroke-dashoffset:0]"
                />
              </svg>
            </span>{" "}
            <Words text="می‌سازیم." start={480} />
          </h1>

          <Reveal delay={500}>
            <p className="mb-9 max-w-[52ch] text-[16px] leading-[1.9] text-dim sm:text-[18.5px]">
              برای کسب‌وکارت{" "}
              <b className="font-black text-ink">پنل مدیریت، فروشگاه آنلاین، سیستم فاکتوردهی و نرم‌افزار اختصاصی</b>{" "}
              می‌سازیم — چیزی که واقعاً تو کسب‌وکارت اجرا می‌شه و مشتری جذب می‌کنه، نه فقط تو دمو خوب
              به‌نظر می‌رسه. یه تیم ۱۰ نفره پشت هر پروژه‌ست، یعنی هم سرعت داری هم پشتیبانی واقعی.
            </p>
          </Reveal>

          <Reveal delay={600}>
            {/* اولین قدم کم‌ریسک‌ترین قدمه (مشاوره‌ی رایگان)، نه تعهد پولی. */}
            <div className="flex flex-wrap items-center gap-4">
              <a href="#lead-form" className="btn-primary magnetic !px-8 !py-4 !text-[16px]">
                مشاوره رایگان پروژه من
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} className="h-[16px] w-[16px] rotate-180">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </a>
              <a href="#showcase" className="btn-ghost magnetic">
                نمونه‌کارهای مشابه کسب‌وکارم
              </a>
            </div>
            <p className="mt-4 flex items-center gap-2 font-mono text-[12.5px] text-dim">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} className="h-3.5 w-3.5 text-accent3">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              بدون تعهد — فقط ۱۵ دقیقه گفتگو درباره‌ی کسب‌وکارت
            </p>
          </Reveal>

          <Reveal delay={700}>
            <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {features.map((f, i) => (
                <div key={f.t} className="fx-card rounded-2xl p-4">
                  <span className="mb-2 flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-accent3 to-accent font-mono text-[11px] font-black text-white">
                    0{i + 1}
                  </span>
                  <span className="block text-[14px] font-black leading-relaxed">{f.t}</span>
                  <span className="block text-[12px] leading-relaxed text-dim">{f.d}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* اسلایدر نمونه‌کارها با قاب سه‌بعدی و بج‌های شناور */}
        <div id="work" className="scroll-mt-[90px]">
          <Reveal delay={300}>
            <HeroSlider />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
