import type { ReactNode } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import Trust from "@/components/Trust";
import Reveal from "@/components/Reveal";
import { getCurrentUser } from "@/lib/session";

export const metadata = {
  title: "درباره ما — وب پیکاسو",
  description: "درباره‌ی تیم وب پیکاسو — چرا کسب‌وکارت رو باید به ما بسپاری.",
};

type Feature = { title: string; desc: string; icon: ReactNode };

const features: Feature[] = [
  {
    title: "طراحی اختصاصی، نه قالبی",
    desc: "هر سایت از صفر و مطابق برند خودت طراحی می‌شه؛ نه یه قالب آماده که هزار جای دیگه هم هست.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <path d="M12 3v3M12 18v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M3 12h3M18 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    ),
  },
  {
    title: "سرعت بالا و بهینه",
    desc: "کدنویسی تمیز و بهینه‌سازی فنی از همون اول، برای بارگذاری سریع و تجربه‌ی روان کاربر.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" />
      </svg>
    ),
  },
  {
    title: "پنل مدیریت اختصاصی",
    desc: "محتوا، وبلاگ و سفارش‌ها رو خودت از یه پنل ساده مدیریت می‌کنی، بدون وابستگی به ما.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <rect x="3" y="4" width="18" height="13" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
  {
    title: "سئوی آماده از پایه",
    desc: "ساختار سایت از روز اول برای دیده‌شدن تو گوگل بهینه‌ست، نه یه فکر بعدی.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m20 20-4.35-4.35" />
      </svg>
    ),
  },
  {
    title: "ریسپانسیو روی همه‌ی دستگاه‌ها",
    desc: "از موبایل تا مانیتور بزرگ، سایت درست و کامل نمایش داده می‌شه.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <rect x="2" y="4" width="20" height="13" rx="2" />
        <path d="M8 21h8M9 17v4M15 17v4" />
      </svg>
    ),
  },
  {
    title: "پشتیبانی و گارانتی بعد از تحویل",
    desc: "کار با تحویل پروژه تموم نمی‌شه؛ اگه باگ فنی داشته باشه طبق گارانتی رفعش می‌کنیم.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <path d="M12 3 4.5 6.5v5c0 4.6 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.9 7.5-9.5v-5L12 3Z" />
        <path d="m8.5 12.3 2.4 2.4 4.6-4.9" />
      </svg>
    ),
  },
];

export default async function AboutPage() {
  const isLoggedIn = !!(await getCurrentUser());

  return (
    <>
      <Nav isLoggedIn={isLoggedIn} />

      <PageHero
        eyebrow="About"
        title="درباره‌ی وب پیکاسو"
        desc="یه تیم کوچیک و متخصصیم که سایت و نرم‌افزار اختصاصی برای کسب‌وکارها می‌سازه — از فروشگاه آنلاین گرفته تا پنل مدیریت و راهکارهای هوش مصنوعی، بدون واسطه و با سورس کاملاً مال خودت."
      />

      {/* توضیح کوتاه‌تر و شخصی‌تر درباره‌ی تیم — مکمل تیتر/توضیح بالای PageHero */}
      <section className="relative overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <div className="relative z-[1] mx-auto max-w-container px-6">
          <Reveal className="mx-auto max-w-[760px] rounded-card border border-ink/10 bg-surface/50 p-7 text-center sm:p-10">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-ink/10 bg-canvas px-3.5 py-1.5 font-mono text-[12.5px] font-bold text-ink">
              <span className="h-1.5 w-1.5 flex-shrink-0 animate-pulse-dot rounded-full bg-accent3" />
              داستان ما
            </span>
            <p className="mx-auto max-w-[58ch] text-[15.5px] leading-[2] text-dim">
              وب پیکاسو با یه هدف ساده شروع شد: کسب‌وکارها بتونن یه سایت حرفه‌ای داشته باشن بدون
              اینکه درگیر آژانس‌های بزرگ، قیمت‌های مبهم و ماه‌ها انتظار بشن. تیم ما مستقیم با خودت
              صحبت می‌کنه، دقیقاً می‌فهمه کسب‌وکارت به چی نیاز داره، و سایتی می‌سازه که هم زیبا
              باشه، هم سریع، هم واقعاً برای رشد کارت مفید. از روز اول تا بعد از تحویل، کنارتیم.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ویژگی‌های سایت‌های ما */}
      <section className="relative overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[420px] bg-dot-grid" />
        <span
          className="pointer-events-none absolute -left-[200px] -top-[220px] z-0 h-[520px] w-[520px] rounded-full opacity-35 blur-[130px]"
          style={{ background: "rgba(0, 119, 182, .3)" }}
        />

        <div className="relative z-[1] mx-auto max-w-container px-6">
          <Reveal className="mb-12 flex items-baseline gap-4">
            <span className="flex h-8 items-center rounded-full border border-ink/10 bg-surface px-3.5 font-mono text-sm font-bold text-ink">
              Features
            </span>
            <div>
              <h2 className="font-display text-[28px] font-normal sm:text-[34px] lg:text-[40px]">
                ویژگی‌های سایت‌های وب پیکاسو
              </h2>
              <p className="mt-2.5 max-w-[62ch] text-[15px] text-dim">
                چیزهایی که هر پروژه‌ای که تحویل می‌دیم، همیشه داره.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <Reveal
                key={f.title}
                delay={i * 60}
                className="group flex flex-col gap-4 rounded-card border border-ink/10 bg-surface/50 p-6 transition hover:-translate-y-1 hover:border-accent/40"
              >
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[10px] bg-accent/10 p-2.5 text-accent transition-transform duration-300 group-hover:scale-110">
                  {f.icon}
                </span>
                <div>
                  <h4 className="mb-1.5 text-[15.5px] font-bold text-ink">{f.title}</h4>
                  <p className="text-[13.5px] leading-relaxed text-dim">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Trust />

      <section className="relative overflow-hidden border-t border-ink/10 py-16 sm:py-20">
        <div className="relative z-[1] mx-auto max-w-container px-6">
          <Reveal className="flex flex-col items-center gap-5 rounded-card border border-ink/10 bg-surface/50 p-8 text-center sm:p-12">
            <h2 className="max-w-[24ch] font-display text-2xl font-normal sm:text-[32px]">
              آماده‌ای پروژه‌ت رو شروع کنیم؟
            </h2>
            <p className="max-w-[52ch] text-[14.5px] text-dim">
              پلن‌ها و قیمت‌های شروع رو تو صفحه‌ی «ثبت سفارش» ببین، یا مستقیم درخواستت رو بفرست تا
              باهات هماهنگ کنیم.
            </p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/order"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-[14.5px] font-semibold text-white shadow-glow transition hover:-translate-y-0.5"
              >
                مشاهده‌ی پلن‌ها و ثبت سفارش
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-[15px] w-[15px]">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-canvas px-6 py-3 text-[14.5px] font-bold text-ink transition hover:border-accent hover:text-accent"
              >
                تماس با ما
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </>
  );
}
