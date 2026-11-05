import BrandMark from "./BrandMark";

/** هیرو — «آسمان لوندر» نسخه‌ی ۲: ابرهای نرم (بلور واقعی، نه نویز)، هاله‌های
 *  شفق صورتی/آبی/بنفش، ستاره‌های چشمک‌زن، خوشه‌های شکوفه‌ی یاسی پایین، سکه‌ی
 *  مشکی فلزی با نشان برند و حلقه‌ی مداری، و کارت‌های شیشه‌ای شناور دورش.
 *  رنگ‌های آسمون ثابتن (مثل یه تصویر)؛ فقط پایینش به canvas تم محو می‌شه. */

const stack = ["Next.js", "React", "Node.js", "Tailwind CSS", "ASP.NET"];

// deterministic pseudo-random so server and client render the same scene
function rnd(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

const sparkles = Array.from({ length: 16 }, (_, i) => ({
  left: `${(4 + rnd(i + 1) * 92).toFixed(2)}%`,
  top: `${(4 + rnd(i + 40) * 48).toFixed(2)}%`,
  size: 8 + Math.round(rnd(i + 80) * 12),
  delay: `${(rnd(i + 120) * 4).toFixed(2)}s`,
}));

const BLOOM = ["#6D3FE6", "#8B5CF6", "#A47BFF", "#C3A6FF", "#7C4DEB", "#9F7AEA", "#E3A6FF"];
function bloomCluster(seed: number, n: number) {
  return Array.from({ length: n }, (_, i) => ({
    x: Math.round(rnd(seed + i) * 1000) / 10,
    y: Math.round((30 + rnd(seed + i + 300) * 70) * 10) / 10,
    r: Math.round((2.5 + rnd(seed + i + 600) * 6) * 10) / 10,
    c: BLOOM[Math.floor(rnd(seed + i + 900) * BLOOM.length)],
  }));
}
const bloomLeft = bloomCluster(1, 150);
const bloomRight = bloomCluster(500, 150);

function Cloud({ className, puffs }: { className: string; puffs: [number, number, number][] }) {
  return (
    <div className={`sky-cloud ${className}`}>
      {puffs.map(([x, y, s], i) => (
        <span key={i} style={{ left: `${x}%`, top: `${y}%`, width: `${s}%`, aspectRatio: "1" }} />
      ))}
    </div>
  );
}

function GlassCard({ className, children }: { className: string; children: React.ReactNode }) {
  return <div className={`glass-card ${className}`}>{children}</div>;
}

export default function Hero() {
  return (
    <section className="sky-hero relative isolate overflow-hidden">
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="sky-hero__base absolute inset-0" />
        {/* شفق */}
        <span className="sky-aurora left-[-12%] top-[18%] h-[60%] w-[46%] bg-[#ff8ad8]" />
        <span className="sky-aurora right-[-10%] top-[10%] h-[55%] w-[42%] bg-[#7fe3ff] [animation-delay:-6s]" />
        <span className="sky-aurora left-[28%] top-[42%] h-[50%] w-[44%] bg-[#8b5cf6] [animation-delay:-11s]" />
        {/* ابرها */}
        <Cloud className="left-[-6%] top-[6%] h-[22%] w-[42%] opacity-90" puffs={[[0, 40, 30], [18, 20, 34], [40, 30, 30], [58, 42, 26], [10, 55, 40], [38, 55, 36]]} />
        <Cloud className="right-[-8%] top-[2%] h-[24%] w-[46%] opacity-80 [animation-delay:-9s]" puffs={[[5, 45, 28], [22, 22, 34], [46, 30, 32], [66, 45, 26], [16, 58, 38], [44, 58, 40]]} />
        <Cloud className="left-[20%] top-[34%] h-[18%] w-[60%] opacity-50 [animation-delay:-4s]" puffs={[[0, 50, 20], [14, 30, 24], [32, 38, 22], [50, 30, 26], [70, 45, 22], [24, 60, 30], [56, 60, 28]]} />
        {/* ستاره‌ها */}
        {sparkles.map((s, i) => (
          <svg key={i} viewBox="0 0 24 24" className="sky-sparkle" style={{ left: s.left, top: s.top, width: s.size, height: s.size, animationDelay: s.delay }}>
            <path d="M12 0c.8 6.4 5.6 11.2 12 12-6.4.8-11.2 5.6-12 12-.8-6.4-5.6-11.2-12-12C6.4 11.2 11.2 6.4 12 0z" fill="#fff" />
          </svg>
        ))}
        {/* شکوفه‌ها */}
        <svg className="absolute bottom-[12%] left-0 h-[38%] w-[34%] [-webkit-mask-image:linear-gradient(to_bottom,#000_45%,transparent_95%)] [mask-image:linear-gradient(to_bottom,#000_45%,transparent_95%)]" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <filter id="bloom-soft">
              <feGaussianBlur stdDeviation="0.9" />
            </filter>
          </defs>
          <g filter="url(#bloom-soft)">
            {bloomLeft.map((b, i) => (
              <ellipse key={i} cx={b.x * 0.9} cy={b.y + (b.x / 100) * 22} rx={b.r} ry={b.r * 0.85} fill={b.c} opacity={0.75 + (i % 3) * 0.08} />
            ))}
          </g>
        </svg>
        <svg className="absolute bottom-[12%] right-0 h-[38%] w-[34%] [-webkit-mask-image:linear-gradient(to_bottom,#000_45%,transparent_95%)] [mask-image:linear-gradient(to_bottom,#000_45%,transparent_95%)]" viewBox="0 0 100 100" preserveAspectRatio="none">
          <g filter="url(#bloom-soft)">
            {bloomRight.map((b, i) => (
              <ellipse key={i} cx={10 + b.x * 0.9} cy={b.y + ((100 - b.x) / 100) * 22} rx={b.r} ry={b.r * 0.85} fill={b.c} opacity={0.75 + (i % 3) * 0.08} />
            ))}
          </g>
        </svg>
        <Cloud
          className="bottom-[10%] left-[-5%] h-[20%] w-[110%] opacity-70 [animation-duration:70s]"
          puffs={[[0, 40, 14], [10, 30, 16], [22, 42, 14], [34, 34, 15], [46, 44, 13], [58, 32, 16], [70, 42, 14], [82, 30, 16], [92, 40, 12]]}
        />
        <div className="sky-hero__fade absolute inset-x-0 bottom-0 h-[30%]" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100svh-72px)] max-w-container flex-col items-center px-5 pb-10 pt-12 text-center sm:pt-14">
        <span
          data-hero-item
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/60 px-4 py-1.5 text-[12.5px] font-bold text-[#1A1033] shadow-[0_8px_30px_-12px_rgba(109,40,217,0.5)] backdrop-blur-md"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#DB2777] opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#DB2777]" />
          </span>
          طراحی سایت · نرم‌افزار اختصاصی · سئو
        </span>

        <h1 data-hero-item className="max-w-[18ch] text-[40px] font-black leading-[1.25] tracking-[-0.025em] text-[#010102] sm:text-[58px] lg:text-[68px]">
          ما نرم‌افزار نمی‌سازیم؛
          <br />
          <span className="text-iris-deep">ابزار پول‌سازی</span> می‌سازیم.
        </h1>

        <p data-hero-item className="mt-5 max-w-[56ch] text-[15px] font-semibold leading-[1.9] text-[#1A1033]/80 sm:text-[17px]">
          پنل مدیریت، فروشگاه آنلاین و نرم‌افزار اختصاصی؛ چیزی که واقعاً توی کسب‌وکارت اجرا می‌شه و مشتری میاره.
        </p>

        {/* سکه + کارت‌های شناور */}
        <div data-hero-item className="relative my-9 w-full sm:my-11">
          <div className="sky-coin-stage mx-auto">
            <span className="sky-coin__halo" />
            <span className="sky-coin__orbit">
              <i />
            </span>
            <div className="sky-coin-wrap">
              <div className="sky-coin">
                <span className="sky-coin__edge" />
                <span className="sky-coin__face">
                  <BrandMark className="sky-coin__logo" idSuffix="hero" />
                  <span className="sky-coin__shine" />
                </span>
              </div>
              <span className="sky-coin__shadow" />
            </div>
          </div>

          <div className="pointer-events-none absolute inset-0 hidden lg:block">
            <GlassCard className="left-[6%] top-[0%] [animation-delay:-1s]">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#ff8ad8] text-white">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.4}>
                  <path d="M5 12l5 5L19 7" />
                </svg>
              </span>
              <span className="text-right">
                <b className="block text-[13.5px] text-[#010102]">سفارش جدید رسید</b>
                <span className="text-[11.5px] text-[#4a4068]">فروشگاه آنلاین · همین الان</span>
              </span>
            </GlassCard>

            <GlassCard className="right-[5%] top-[6%] !flex-col !items-stretch [animation-delay:-3s]">
              <span className="flex items-center justify-between gap-6 text-[12.5px]">
                <b className="text-[#010102]">بازدید سایت</b>
                <span className="rounded-full bg-[#10b981]/15 px-2 py-0.5 text-[11px] font-black text-[#047857]">رو به رشد</span>
              </span>
              <svg viewBox="0 0 160 50" className="mt-2 h-[50px] w-[170px]">
                <defs>
                  <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#8b5cf6" stopOpacity=".45" />
                    <stop offset="1" stopColor="#8b5cf6" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="spark-line" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="#8b5cf6" />
                    <stop offset="1" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
                <path d="M0 42 20 38 40 40 60 30 80 32 100 22 120 24 140 12 160 6V50H0Z" fill="url(#spark-fill)" />
                <path d="M0 42 20 38 40 40 60 30 80 32 100 22 120 24 140 12 160 6" fill="none" stroke="url(#spark-line)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="160" cy="6" r="4" fill="#ec4899" />
              </svg>
            </GlassCard>

            <GlassCard className="bottom-[0%] left-[12%] [animation-delay:-5s]">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#010102] text-white">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
                  <rect x="3" y="4" width="18" height="16" rx="3" />
                  <path d="M3 9h18M8 14h4" />
                </svg>
              </span>
              <span className="text-right">
                <b className="block text-[13.5px] text-[#010102]">پنل مدیریت اختصاصی</b>
                <span className="flex gap-1 pt-1">
                  <i className="h-1.5 w-8 rounded-full bg-[#8b5cf6]" />
                  <i className="h-1.5 w-5 rounded-full bg-[#ff8ad8]" />
                  <i className="h-1.5 w-3 rounded-full bg-[#7fe3ff]" />
                </span>
              </span>
            </GlassCard>

            <GlassCard className="bottom-[6%] right-[13%] [animation-delay:-7s]">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#7fe3ff] to-[#8b5cf6] text-white">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
              </span>
              <span className="text-right">
                <b className="block text-[13.5px] text-[#010102]">دیده شدن در گوگل</b>
                <span className="text-[11.5px] text-[#4a4068]">سئوی فنی از روز اول</span>
              </span>
            </GlassCard>
          </div>
        </div>

        <div data-hero-item className="flex flex-wrap justify-center gap-3">
          <a
            href="#lead-form"
            className="group relative isolate inline-flex items-center gap-2 overflow-hidden rounded-full bg-[#010102] px-8 py-4 text-[15.5px] font-black text-white shadow-[0_18px_50px_-14px_rgba(109,40,217,0.8)] transition hover:-translate-y-0.5"
          >
            <span className="absolute inset-0 -z-10 bg-gradient-to-l from-[#8b5cf6] via-[#ec4899] to-[#8b5cf6] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            مشاوره رایگان پروژه من
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} className="h-[15px] w-[15px] rotate-180">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>
          <a
            href="#showcase"
            className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-8 py-4 text-[15.5px] font-black text-[#010102] shadow-[0_14px_40px_-16px_rgba(26,16,51,0.5)] backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white"
          >
            نمونه‌کارها
          </a>
        </div>

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
