import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTrade } from "@/lib/siteTemplates/trades";
import { offerCopyFor } from "@/lib/offerContent";
import { offerTrades } from "../../o/trades";
import QuickOrder from "./QuickOrder";

// Short ad page per trade, for SMS campaigns (/p/<trade>, e.g. /p/cafe).
// Deliberately little content: one problem, one promise, a live demo of
// that trade's site, and only two ways forward — call now or leave a name
// and number (saved like the other orders). ?c=<sms code> credits a
// personal SMS link and ?n=<business> pre-fills the business name.

const TEL = "tel:+989965745535";
const WA = "https://wa.me/989965745535?text=";

export const dynamicParams = false;

export function generateStaticParams() {
  return offerTrades().map((t) => ({ trade: t.id }));
}

export function generateMetadata({ params }: { params: { trade: string } }): Metadata {
  const t = getTrade(params.trade);
  return {
    title: t ? `سایت اختصاصی ${t.label} — وب پیکاسو` : "وب پیکاسو",
    description: t ? `دموی زنده‌ی سایت ${t.label} رو ببین و با مشاوره‌ی رایگان سفارش بده.` : undefined,
    robots: { index: false, follow: false },
  };
}

/** Black or white text, whichever reads better on the trade color. */
function onColor(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? "#0a0a0c" : "#ffffff";
}

export default function TradeAdPage({ params }: { params: { trade: string } }) {
  const t = getTrade(params.trade);
  if (!t) notFound();
  const copy = offerCopyFor(t.id);
  const accent = t.colors.primary;
  const onAccent = onColor(accent);
  const wa = WA + encodeURIComponent(`سلام، برای طراحی سایت ${t.label} سوال داشتم`);

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#07070a] pb-24 font-fa text-white sm:pb-0" style={{ ["--ac" as string]: accent }}>
      {/* soft light in the trade's color */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[620px] bg-[radial-gradient(70%_60%_at_50%_0%,color-mix(in_srgb,var(--ac)_35%,transparent),transparent_70%)]" />

      <header className="relative z-10 mx-auto flex h-16 max-w-[980px] items-center justify-between px-4">
        <span className="flex items-center gap-2">
          <span className="relative h-9 w-9 overflow-hidden rounded-xl ring-1 ring-white/15">
            <Image src="/logo.webp" alt="وب پیکاسو" fill sizes="36px" className="object-cover" priority />
          </span>
          <span className="font-display text-[18px]">وب پیکاسو</span>
        </span>
        <a href={TEL} dir="ltr" className="rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-[14px] font-bold">
          📞 0996 574 5535
        </a>
      </header>

      <main className="relative z-10 mx-auto max-w-[980px] px-4">
        {/* hero: problem → promise → call */}
        <section className="grid items-center gap-10 pt-6 sm:pt-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="text-center lg:text-right">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-1.5 text-[13px] font-bold">
              <span className="h-2 w-2 animate-pulse rounded-full" style={{ background: accent }} />
              ویژه‌ی {t.label}
            </span>
            <h1 className="mt-5 font-display text-[30px] font-normal leading-[1.4] sm:text-[42px]">{copy.pain}</h1>
            <p className="mx-auto mt-4 max-w-[46ch] text-[16px] leading-8 text-white/70 lg:mx-0">{copy.sub}</p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row lg:justify-start">
              <a href={TEL} className="flex h-14 flex-1 items-center justify-center gap-2 rounded-xl text-[17px] font-black shadow-lg sm:flex-none sm:px-8" style={{ background: accent, color: onAccent }}>
                📞 همین الان زنگ بزن
              </a>
              <a href="#order" className="flex h-14 flex-1 items-center justify-center rounded-xl border border-white/20 bg-white/[0.06] text-[16px] font-bold sm:flex-none sm:px-8">
                ثبت سفارش در ۳۰ ثانیه
              </a>
            </div>
            <ul className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[13.5px] text-white/70 lg:justify-start">
              <li>✓ مشاوره‌ی رایگان و بدون تعهد</li>
              <li>✓ طراحی مخصوص {t.label}</li>
              <li>✓ ۳ ماه پشتیبانی رایگان</li>
            </ul>
          </div>

          {/* live demo of this trade's site, in a phone frame */}
          <div className="mx-auto w-full max-w-[300px]">
            <div className="relative overflow-hidden rounded-[2.4rem] border-[10px] border-[#1b1b20] bg-black shadow-2xl shadow-black/60" style={{ aspectRatio: "9 / 18.5" }}>
              <span className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-black" />
              <iframe
                src={`/o/demo/${t.id}`}
                title={`دموی سایت ${t.label}`}
                loading="lazy"
                className="absolute left-0 top-0 h-[200%] w-[200%] origin-top-left scale-50 border-0"
              />
            </div>
            <a href={`/o/demo/${t.id}`} target="_blank" rel="noopener" className="mt-3 block text-center text-[13.5px] font-bold text-white/75 underline-offset-4 hover:underline">
              {copy.demoLabel} ←
            </a>
          </div>
        </section>

        {/* what changes, in three lines */}
        <section className="mt-16 rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <h2 className="text-center font-display text-[24px] font-normal sm:text-[28px]">با سایت اختصاصی {t.label}:</h2>
          <ul className="mx-auto mt-6 grid max-w-[760px] gap-3 sm:grid-cols-3">
            {copy.after.map((x) => (
              <li key={x} className="flex items-start gap-3 rounded-2xl bg-white/[0.04] p-4 text-[15px] leading-7">
                <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[13px] font-black" style={{ background: accent, color: onAccent }}>✓</span>
                {x}
              </li>
            ))}
          </ul>
        </section>

        {/* order */}
        <section id="order" className="mx-auto mt-16 max-w-[520px] scroll-mt-6 rounded-3xl border border-white/15 bg-[#0f0f14] p-6 shadow-2xl sm:p-8">
          <h2 className="text-center font-display text-[26px] font-normal">سفارش سایت {t.label}</h2>
          <p className="mb-6 mt-2 text-center text-[14.5px] text-white/65">اسم و شماره‌ت رو بذار؛ برای مشاوره‌ی رایگان باهات تماس می‌گیریم.</p>
          <QuickOrder tradeLabel={t.label} accent={accent} onAccent={onAccent} />
          <div className="mt-5 flex items-center gap-3 text-[13px] text-white/45 before:h-px before:flex-1 before:bg-white/10 after:h-px after:flex-1 after:bg-white/10">یا</div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <a href={TEL} className="flex h-12 items-center justify-center rounded-xl border border-white/15 text-[15px] font-bold">📞 تماس</a>
            <a href={wa} target="_blank" rel="noopener" className="flex h-12 items-center justify-center rounded-xl border border-emerald-400/40 text-[15px] font-bold text-emerald-300">💬 واتساپ</a>
          </div>
        </section>

        <p className="mt-10 pb-10 text-center text-[12.5px] text-white/35">
          وب پیکاسو — طراحی سایت اختصاصی برای کسب‌وکارها ·{" "}
          <a href="/" className="underline-offset-4 hover:underline">webpikaso.ir</a>
        </p>
      </main>

      {/* phones: call / order always one tap away */}
      <div className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-2 gap-2 border-t border-white/10 bg-[#07070a]/90 p-3 backdrop-blur-lg sm:hidden">
        <a href={TEL} className="flex h-12 items-center justify-center rounded-xl text-[16px] font-black" style={{ background: accent, color: onAccent }}>📞 تماس</a>
        <a href="#order" className="flex h-12 items-center justify-center rounded-xl border border-white/20 bg-white/[0.06] text-[16px] font-bold">ثبت سفارش</a>
      </div>
    </div>
  );
}
