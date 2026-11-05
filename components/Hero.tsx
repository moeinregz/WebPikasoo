import HeroSlider from "./HeroSlider";

const features = [
  { t: "بدون هزینه پنهان", d: "قیمت و امکانات از اول شفافه" },
  { t: "سایت نتیجه‌محور", d: "برای فروش و مشتری بیشتر، نه فقط ظاهر" },
  { t: "پشتیبانی واقعی", d: "بعد از تحویل هم تنها نیستی" },
];

/** هیرو — هر تکه‌ای که data-hero-item داره، بعد از تموم شدن اینترو با
 *  تایم‌لاین GSAP (IntroSplash) پله‌پله وارد می‌شه. شکل‌های هندسی مات
 *  پشت صحنه با data-speed روی اسکرول پارالاکس دارن (ScrollFx). */
export default function Hero() {
  return (
    <section className="relative overflow-hidden pb-[110px] pt-20">
      <div className="pointer-events-none absolute inset-0 z-0 h-[640px] bg-dot-grid" />

      {/* شکل‌های هندسی مات و برجسته — همون رنگ‌های پالت، سایه‌ی تخت */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 hidden md:block">
        <span data-speed="-0.35" className="matte absolute left-[6%] top-[90px] h-16 w-16 rotate-12 rounded-2xl !border-ink bg-accent" />
        <span data-speed="0.25" className="matte absolute left-[44%] top-[64px] h-9 w-9 rounded-full !border-ink bg-accent3" />
        <span data-speed="-0.2" className="matte absolute bottom-[70px] left-[40%] h-12 w-24 -rotate-6 rounded-xl !border-ink bg-frosted-blue" />
        <span data-speed="0.45" className="matte absolute right-[3%] top-[48%] h-10 w-10 rotate-45 !border-ink bg-accent2" />
      </div>

      <div className="relative z-10 mx-auto mt-14 grid max-w-container grid-cols-1 gap-14 px-6 md:grid-cols-[1.05fr_.95fr] md:items-center">
        <div>
          <span
            data-hero-item
            className="matte matte-sm mb-7 inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-mono text-[12.5px] font-bold text-ink"
          >
            <span className="h-2 w-2 animate-pulse-dot rounded-full bg-accent3" />
            آماده‌ی همکاری روی پروژه‌های جدید
          </span>

          <h1 className="mb-6 font-display text-[42px] font-normal leading-[1.28] sm:text-[56px] lg:text-[66px]">
            <span data-hero-item className="block">
              ما نرم‌افزار نمی‌سازیم؛
            </span>
            <span data-hero-item className="block">
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
            </span>
          </h1>

          <p data-hero-item className="mb-8 max-w-[52ch] text-[15.5px] text-dim sm:text-[18px]">
            برای کسب‌وکارت{" "}
            <b className="font-semibold text-ink">پنل مدیریت، فروشگاه آنلاین، سیستم فاکتوردهی و نرم‌افزار اختصاصی</b>{" "}
            می‌سازیم — چیزی که واقعاً تو کسب‌وکارت اجرا می‌شه و مشتری جذب می‌کنه، نه فقط تو دمو خوب به‌نظر
            می‌رسه. یه تیم ۱۰ نفره پشت هر پروژه‌ست، یعنی هم سرعت داری هم پشتیبانی واقعی.
          </p>

          <div data-hero-item className="my-9 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {features.map((f, i) => (
              <div key={f.t} className="matte matte-sm matte-hover rounded-[14px] p-4">
                <span className="mb-2 flex h-7 w-7 items-center justify-center rounded-lg border-2 border-ink bg-accent font-mono text-[11px] font-black text-white">
                  {i + 1}
                </span>
                <span className="block text-sm font-bold leading-relaxed">{f.t}</span>
                <span className="block text-xs leading-relaxed text-dim">{f.d}</span>
              </div>
            ))}
          </div>

          {/* اولین قدم کم‌ریسک‌ترین قدمه (مشاوره‌ی رایگان)، نه یه تعهد پولی. */}
          <div data-hero-item>
            <div className="flex flex-wrap gap-4">
              <a
                href="#lead-form"
                className="matte-btn inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-[15px] font-black text-white"
              >
                مشاوره رایگان پروژه من
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} className="h-[15px] w-[15px] rotate-180">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </a>
              <a
                href="#showcase"
                className="matte-btn inline-flex items-center gap-2 rounded-xl bg-canvas px-6 py-3.5 text-[15px] font-bold text-ink"
              >
                نمونه‌کارهای مشابه کسب‌وکارم
              </a>
            </div>
            <p className="mt-4 font-mono text-[12.5px] text-dim">بدون تعهد — فقط ۱۵ دقیقه گفتگو درباره‌ی کسب‌وکارت</p>
          </div>
        </div>

        <div id="work" data-hero-item className="scroll-mt-[90px]">
          <div data-speed="0.12">
            <HeroSlider />
          </div>
        </div>
      </div>
    </section>
  );
}
