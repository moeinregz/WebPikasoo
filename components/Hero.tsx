/** هیرو — «آسمان لوندر»: آسمون ابری یاسی که پایینش به بنفش عمیق و بعد به
 *  کبالت مشکیِ صفحه می‌رسه، تیتر درشت مشکی وسط، و یه سکه‌ی سه‌بعدی مشکی با
 *  نشان برند که آروم می‌چرخه و شناوره. رنگ‌های خودِ آسمون ثابتن (مستقل از
 *  تم روشن/تاریک) چون مثل یه تصویر رفتار می‌کنن؛ فقط پایینش به canvas تم
 *  محو می‌شه. هر تکه‌ای که data-hero-item داره بعد از اینترو (IntroSplash)
 *  پله‌پله وارد می‌شه. */
const stack = ["Next.js", "React", "Node.js", "Tailwind CSS", "ASP.NET"];

export default function Hero() {
  return (
    <section className="sky-hero relative isolate overflow-hidden">
      {/* آسمون: گرادیان + لایه‌های ابر نویزی + ردیف «باغ یاسی» پایین */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="sky-hero__base absolute inset-0" />
        <svg className="sky-hero__clouds sky-hero__clouds--back absolute inset-x-[-10%] top-[-6%] h-[78%] w-[120%]" preserveAspectRatio="none">
          <filter id="sky-cloud-a" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.0045 0.009" numOctaves="5" seed="7" />
            <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 -1.6 1.15" />
            <feGaussianBlur stdDeviation="1.2" />
          </filter>
          <rect width="100%" height="100%" filter="url(#sky-cloud-a)" />
        </svg>
        <svg className="sky-hero__clouds sky-hero__clouds--front absolute inset-x-[-10%] top-[18%] h-[70%] w-[120%]" preserveAspectRatio="none">
          <filter id="sky-cloud-b" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.006 0.012" numOctaves="5" seed="21" />
            <feColorMatrix values="0 0 0 0 0.93  0 0 0 0 0.9  0 0 0 0 1  0 0 0 -1.9 1.2" />
            <feGaussianBlur stdDeviation="1.5" />
          </filter>
          <rect width="100%" height="100%" filter="url(#sky-cloud-b)" />
        </svg>
        {/* درخت‌های گل یاسی دو طرف پایین */}
        <svg className="absolute inset-x-0 bottom-[12%] h-[32%] w-full" viewBox="0 0 1440 400" preserveAspectRatio="none">
          <filter id="sky-bloom" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="2" seed="3" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="16" />
            <feGaussianBlur stdDeviation="2.4" />
          </filter>
          <g filter="url(#sky-bloom)">
            <path fill="#7C5CE6" d="M0 120c60-60 150-70 210-20s120 10 180 60 90 120 120 240H0z" opacity=".9" />
            <path fill="#9479EC" d="M0 190c70-50 140-40 190 0s110 40 150 110 40 100 40 100H0z" />
            <path fill="#7C5CE6" d="M1440 110c-70-60-160-60-220-10s-120 20-180 80-80 120-100 220h500z" opacity=".9" />
            <path fill="#9479EC" d="M1440 180c-80-50-150-30-200 10s-110 50-150 120-30 90-30 90h380z" />
          </g>
        </svg>
        <div className="sky-hero__fade absolute inset-x-0 bottom-0 h-[34%]" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100svh-72px)] max-w-container flex-col items-center px-5 pb-10 pt-16 text-center sm:pt-20">
        <span
          data-hero-item
          className="mb-6 inline-flex items-center gap-2 rounded-md border border-[#010102]/15 bg-white/55 px-3.5 py-1.5 text-[12px] font-bold tracking-wide text-[#010102] backdrop-blur-sm"
        >
          <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-[#7C5CE6]" />
          طراحی سایت · نرم‌افزار اختصاصی · سئو
        </span>

        <h1 data-hero-item className="max-w-[17ch] text-[40px] font-black leading-[1.3] tracking-[-0.02em] text-[#010102] sm:text-[60px] lg:text-[72px]">
          ما نرم‌افزار نمی‌سازیم؛
          <br />
          ابزار پول‌سازی می‌سازیم.
        </h1>

        <p data-hero-item className="mt-5 max-w-[56ch] text-[15px] font-semibold leading-[1.9] text-[#1A1033]/75 sm:text-[16.5px]">
          پنل مدیریت، فروشگاه آنلاین و نرم‌افزار اختصاصی؛ چیزی که واقعاً توی کسب‌وکارت اجرا می‌شه و مشتری میاره.
        </p>


        {/* سکه‌ی سه‌بعدی */}
        <div data-hero-item className="sky-coin-wrap my-9 sm:my-11">
          <div className="sky-coin">
            <span className="sky-coin__edge" />
            <span className="sky-coin__face">
              <span className="sky-coin__mark font-display">پ</span>
            </span>
          </div>
          <span className="sky-coin__shadow" />
        </div>


        <div data-hero-item className="mt-2 flex flex-wrap justify-center gap-3">
          <a
            href="#lead-form"
            className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-[15px] font-black text-[#010102] shadow-[0_14px_40px_-12px_rgba(26,16,51,0.55)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-12px_rgba(26,16,51,0.65)]"
          >
            مشاوره رایگان پروژه من
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} className="h-[15px] w-[15px] rotate-180">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>
          <a
            href="#showcase"
            className="inline-flex items-center gap-2 rounded-full border border-white/45 bg-white/10 px-7 py-3.5 text-[15px] font-bold text-white backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/20"
          >
            نمونه‌کارها
          </a>
        </div>

        {/* مثل ردیف «Backed by» — تکنولوژی‌هایی که باهاشون می‌سازیم */}
        <div data-hero-item className="mt-auto w-full pt-14">
          <p className="mb-4 text-[11.5px] font-black tracking-[0.25em] text-ink/70">ساخته‌شده با</p>
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-ink sm:gap-x-0" dir="ltr">
            {stack.map((t, i) => (
              <li key={t} className="flex items-center">
                {i > 0 && <span className="mx-6 hidden h-5 w-px bg-ink/30 sm:block" />}
                <span className="font-sans text-[17px] font-bold tracking-tight sm:text-[20px]">{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
