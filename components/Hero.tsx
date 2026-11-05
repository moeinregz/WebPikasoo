import HeroShowcase from "./HeroShowcase";
import type { ShowcaseSite } from "./BusinessShowcase";

/** هیرو «Midnight» — پرده‌ی نور: خطوط عمودی ریز که از بالا آبی الکتریکی روشن
 *  می‌شن و پایین وسط به یه طلوع نارنجی طالبی می‌رسن؛ تیتر سریف (نسخ برای
 *  فارسی، Instrument Serif برای لاتین)، آمار دو طرف، دکمه‌ی حلقه‌ای شیشه‌ای
 *  وسط، و پایین سه کارت شیشه‌ای کج با نمونه‌کارهای واقعی که با فلش‌های دو
 *  طرف ورق می‌خورن. data-hero-item ها بعد از اینترو پله‌پله وارد می‌شن. */

const statsStart = [
  { v: "10", u: "نفر", l: "تیم متخصص و درگیر" },
  { v: "35+", u: "", l: "پروژه‌ی تحویل‌شده" },
];
const statsEnd = [
  { v: "9", u: "صنف", l: "کسب‌وکار مختلف" },
  { v: "30", u: "روز", l: "گارانتی رفع باگ" },
];

function Stat({ v, u, l }: { v: string; u: string; l: string }) {
  return (
    <div>
      <div className="flex items-baseline gap-1.5 text-white">
        <span className="font-serif text-[34px] leading-none" dir="ltr">
          {v}
        </span>
        {u && <span className="text-[13px] text-white/70">{u}</span>}
      </div>
      <div className="mt-1.5 text-[12px] font-medium text-white/55">{l}</div>
    </div>
  );
}

export default function Hero({ sites = [] }: { sites?: ShowcaseSite[] }) {
  return (
    <section className="relative isolate overflow-hidden">
      <div aria-hidden className="curtain -z-10">
        <div className="curtain__glow" />
        <div className="curtain__lines" />
        <div className="curtain__vignette" />
        <div className="curtain__grain" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100svh-72px)] max-w-[1180px] flex-col px-5 pt-14 sm:px-6 sm:pt-20">
        <div className="relative text-center">
          <span data-hero-item className="mono-label mb-7 rounded-full border border-white/15 bg-white/[0.04] px-4 py-1.5 !text-white/80 backdrop-blur">
            طراحی سایت · نرم‌افزار اختصاصی · سئو
          </span>

          <h1
            data-hero-item
            className="mx-auto max-w-[22ch] font-display text-[40px] font-semibold leading-[1.5] text-white [text-shadow:0_4px_40px_rgba(2,7,10,0.55)] sm:text-[56px] lg:text-[66px]"
          >
            ما نرم‌افزار نمی‌سازیم؛
            <br />
            <span className="text-ember">ابزار پول‌سازی</span> می‌سازیم
            <span className="font-serif italic text-[#fc734d]">.</span>
          </h1>

          <p data-hero-item className="mx-auto mt-5 max-w-[52ch] text-[14.5px] font-medium leading-[2] text-white/70 sm:text-[16px]">
            پنل مدیریت، فروشگاه آنلاین و نرم‌افزار اختصاصی؛ چیزی که واقعاً توی کسب‌وکارت اجرا می‌شه و مشتری میاره.
          </p>

          {/* آمار دو طرف (دسکتاپ) */}
          <div data-hero-item className="pointer-events-none absolute inset-y-0 right-0 hidden w-[180px] flex-col justify-center gap-8 text-right lg:flex">
            {statsStart.map((s) => (
              <Stat key={s.l} {...s} />
            ))}
          </div>
          <div data-hero-item className="pointer-events-none absolute inset-y-0 left-0 hidden w-[180px] flex-col justify-center gap-8 text-left lg:flex">
            {statsEnd.map((s) => (
              <Stat key={s.l} {...s} />
            ))}
          </div>

          {/* آمار موبایل */}
          <div data-hero-item className="mx-auto mt-8 grid max-w-[420px] grid-cols-4 gap-2 text-center lg:hidden">
            {[...statsStart, ...statsEnd].map((s) => (
              <div key={s.l}>
                <div className="font-serif text-[24px] leading-none text-white" dir="ltr">
                  {s.v}
                </div>
                <div className="mt-1 text-[10.5px] leading-4 text-white/55">{s.l}</div>
              </div>
            ))}
          </div>

          <div data-hero-item className="mt-10 flex flex-col items-center gap-5 sm:mt-12">
            <a href="#lead-form" className="orb-btn" aria-label="مشاوره رایگان پروژه">
              <span className="flex flex-col items-center gap-1 text-[12.5px] font-bold">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
                  <path d="M4 12h3l2-6 4 12 2-6h5" />
                </svg>
                شروع پروژه
              </span>
            </a>
            <a href="#showcase" className="text-[13px] font-medium text-white/60 underline decoration-white/25 underline-offset-4 transition hover:text-white">
              همه‌ی نمونه‌کارها
            </a>
          </div>
        </div>

        {/* نمونه‌کارها روی کارت‌های شیشه‌ای پایین */}
        <div data-hero-item className="mt-auto pt-14">
          <HeroShowcase sites={sites} />
        </div>
      </div>
    </section>
  );
}
