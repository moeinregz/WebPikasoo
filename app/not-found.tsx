import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import { getCurrentUser } from "@/lib/session";

export const metadata = {
  title: "صفحه پیدا نشد — وب پیکاسو",
  description: "این صفحه وجود نداره یا جابه‌جا شده؛ از منوی زیر به سایت وب پیکاسو برگرد.",
};

// فایل ویژه‌ی Next.js — هر مسیری که پیدا نشه (یا notFound() صدا زده بشه)
// خودکار همین رو نشون می‌ده.
export default async function NotFound() {
  const isLoggedIn = !!(await getCurrentUser());

  return (
    <>
      <Nav isLoggedIn={isLoggedIn} />

      <section className="relative flex min-h-[82vh] items-center overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[560px] bg-dot-grid" />
        <span
          className="pointer-events-none absolute -right-[200px] -top-[180px] z-0 h-[520px] w-[520px] animate-float-glow rounded-full opacity-45 blur-[130px]"
          style={{ background: "rgba(0, 119, 182, .4)" }}
        />
        <span
          className="pointer-events-none absolute -left-[220px] bottom-[-160px] z-0 h-[480px] w-[480px] animate-float-glow-slow rounded-full opacity-35 blur-[130px]"
          style={{ background: "rgba(2, 62, 138, .35)" }}
        />

        <div className="relative z-[1] mx-auto flex max-w-container flex-col items-center gap-7 px-6 py-24 text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-surface px-3.5 py-1.5 font-mono text-[12.5px] font-bold text-ink">
              <span className="h-1.5 w-1.5 flex-shrink-0 animate-pulse-dot rounded-full bg-accent3" />
              خطای ۴۰۴ — صفحه پیدا نشد
            </span>
          </Reveal>

          {/* چشمِ دنبال‌کننده — همون موتیف چشمِ لوگوی کوبیستیِ سایت، این‌بار
              داره دنبال صفحه‌ای می‌گرده که وجود نداره. */}
          <Reveal delay={70}>
            <div className="h-[64px] w-[110px] animate-eye-blink" style={{ transformOrigin: "center" }}>
              <svg viewBox="0 0 140 100" className="h-full w-full">
                <path
                  d="M26 16 L104 8"
                  stroke="rgb(var(--color-ink) / .55)"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                <path
                  d="M8 52 Q70 10 132 52 Q70 94 8 52 Z"
                  fill="rgb(var(--color-surface))"
                  stroke="rgb(var(--color-ink) / .4)"
                  strokeWidth="3"
                />
                <g className="animate-eye-look" style={{ transformOrigin: "center" }}>
                  <circle cx="70" cy="52" r="16" fill="#0077B6" />
                  <circle cx="65.5" cy="47.5" r="4" fill="white" />
                </g>
              </svg>
            </div>
          </Reveal>

          {/* عدد 404 با افکت گلیچ — یه لایه‌ی پایه‌ی ثابت + دو لایه‌ی
              رنگی روش که با clip-path نواری تکون می‌خورن، حس دیجیتالِ
              «قطع‌شده/پیدا‌نشده» رو منتقل می‌کنه. */}
          <Reveal delay={130}>
            <div className="relative animate-glitch-shift select-none font-display text-[100px] font-normal leading-none sm:text-[140px] lg:text-[180px]">
              <span className="relative z-[1] text-ink">404</span>
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 z-0 animate-glitch-clip-1 text-accent3 opacity-70"
                style={{ transform: "translate(4px,-3px)" }}
              >
                404
              </span>
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 z-0 animate-glitch-clip-2 text-accent2 opacity-70"
                style={{ transform: "translate(-4px,3px)" }}
              >
                404
              </span>
            </div>
          </Reveal>

          <Reveal delay={180}>
            <p className="max-w-[46ch] text-[15.5px] leading-relaxed text-dim sm:text-[17px]">
              انگار این صفحه یا پاک شده یا از اول وجود نداشته. آدرس رو یه بار
              دیگه چک کن یا از دکمه‌های زیر به سایت برگرد.
            </p>
          </Reveal>

          <Reveal delay={230}>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-3.5">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-lg bg-ink px-6 py-3.5 text-[15px] font-bold text-canvas shadow-glow-soft transition hover:-translate-y-0.5"
              >
                بازگشت به خانه
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-[15px] w-[15px]">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
              <Link
                href="/portfolio"
                className="inline-flex items-center gap-2 rounded-lg border-2 border-ink/15 px-6 py-[13px] text-[15px] font-bold text-ink transition hover:border-accent hover:text-accent"
              >
                مشاهده‌ی نمونه‌کارها
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </>
  );
}
