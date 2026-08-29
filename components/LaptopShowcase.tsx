"use client";

import { useState, type CSSProperties, type ReactNode } from "react";

type ServiceId = "dev" | "store" | "ai";

type ServiceTab = {
  id: ServiceId;
  label: string;
  title: string;
  desc: string;
  bullets: string[];
  accent: string;
  icon: ReactNode;
};

const services: ServiceTab[] = [
  {
    id: "dev",
    label: "توسعه نرم‌افزار",
    title: "توسعه نرم‌افزارهای پیشرفته",
    desc: "از پنل‌های مدیریتی سازمانی تا سیستم‌های اختصاصی و اتوماسیون داخلی — نرم‌افزاری که دقیقاً مطابق فرایند کسب‌وکار شما نوشته می‌شه، نه یه قالب آماده که باید خودتون رو باهاش تطبیق بدید.",
    bullets: [
      "پنل مدیریت و داشبورد اختصاصی",
      "اتصال به API‌های داخلی و خارجی",
      "معماری مقیاس‌پذیر و قابل نگهداری",
    ],
    accent: "#0077B6",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-full w-full">
        <path d="M8 9l-4 3 4 3M16 9l4 3-4 3M14 6l-4 12" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "store",
    label: "سایت فروشگاهی و شرکتی",
    title: "طراحی سایت‌های فروشگاهی و شرکتی",
    desc: "سایتی که هم اعتبار برند شما رو نشون می‌ده و هم واقعاً می‌فروشه؛ از فروشگاه آنلاین با درگاه پرداخت تا وب‌سایت شرکتی حرفه‌ای برای معرفی کسب‌وکار.",
    bullets: [
      "فروشگاه آنلاین با درگاه پرداخت و مدیریت سفارش",
      "طراحی اختصاصی هماهنگ با هویت برند",
      "سرعت بالا و تجربه‌ی کاربری روان روی موبایل",
    ],
    accent: "#00B4D8",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-full w-full">
        <path d="M3 6h18l-1.5 11a2 2 0 01-2 1.7H6.5a2 2 0 01-2-1.7L3 6Z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 6V4.5A2.5 2.5 0 0110.5 2h3A2.5 2.5 0 0116 4.5V6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "ai",
    label: "هوش مصنوعی",
    title: "هوش مصنوعی",
    desc: "دستیارهای هوشمند، اتوماسیون فرایندها و تحلیل داده با هوش مصنوعی — همون تکنولوژی‌ای که کارهای تکراری رو از دوش تیم شما برمی‌داره و تصمیم‌گیری رو سریع‌تر می‌کنه.",
    bullets: [
      "چت‌بات و دستیار هوشمند اختصاصی",
      "اتوماسیون فرایندهای تکراری با AI",
      "تحلیل و پیش‌بینی داده‌های کسب‌وکار",
    ],
    accent: "#023E8A",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-full w-full">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 3v3M12 18v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M3 12h3M18 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" strokeLinecap="round" />
      </svg>
    ),
  },
];

/** «توسعه نرم‌افزار» حالا به‌جای ادیتور کد، خودِ خروجی نهایی رو نشون
 *  می‌ده: یه پنل مدیریت واقعی با نوار کناری، کارت‌های آماری، نمودار و
 *  جدول — چیزی که مشتری واقعاً باهاش کار می‌کنه، نه سورس‌کد پشت صحنه. */
function AdminPanelScreen() {
  const rows = [
    { name: "سفارش #۱۰۴۲", status: "تکمیل‌شده", ok: true },
    { name: "سفارش #۱۰۴۱", status: "در حال پردازش", ok: false },
    { name: "سفارش #۱۰۴۰", status: "تکمیل‌شده", ok: true },
  ];

  return (
    <div className="flex h-full bg-[#0a0a0c]">
      {/* نوار کناری آیکون‌محور */}
      <div className="flex w-[42px] flex-shrink-0 flex-col items-center gap-4 border-l border-white/10 bg-white/[0.03] py-3.5 sm:w-[50px]">
        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-accent text-white">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="h-3.5 w-3.5">
            <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" strokeLinejoin="round" />
          </svg>
        </span>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`h-2 w-2 flex-shrink-0 rounded-[3px] ${i === 0 ? "bg-white/60" : "bg-white/15"}`}
          />
        ))}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* هدر */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-white/10 px-3.5 py-2.5 sm:px-4">
          <span className="font-mono text-[10.5px] font-bold text-white/80 sm:text-[11.5px]">پنل مدیریت</span>
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 flex-shrink-0 animate-pulse-dot rounded-full bg-emerald-400" />
            <span className="h-5 w-5 flex-shrink-0 rounded-full bg-accent/30" />
          </span>
        </div>

        <div className="flex-1 overflow-hidden px-3.5 py-3 sm:px-4">
          {/* کارت‌های آماری */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { l: "فروش امروز", v: "۴۲.۶M", c: "#48CAE4" },
              { l: "سفارش‌ها", v: "۱۲۸", c: "#0077B6" },
              { l: "کاربر فعال", v: "۹۶۴", c: "#023E8A" },
            ].map((s) => (
              <div key={s.l} className="rounded-md border border-white/10 bg-white/[0.03] p-2">
                <div className="h-1.5 w-8 rounded-full" style={{ background: `${s.c}55` }} />
                <div className="mt-2 font-mono text-[11px] font-bold text-white/85 sm:text-[12.5px]">{s.v}</div>
                <div className="mt-0.5 truncate font-mono text-[8px] text-white/35 sm:text-[8.5px]">{s.l}</div>
              </div>
            ))}
          </div>

          {/* نمودار میله‌ای کوچیک */}
          <div className="mt-2.5 flex h-[46px] items-end gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 sm:h-[54px]">
            {[40, 65, 50, 80, 60, 95, 70, 55, 85, 62].map((h, i) => (
              <span
                key={i}
                className="flex-1 rounded-t-sm"
                style={{ height: `${h}%`, background: i === 5 ? "#48CAE4" : "rgba(0,119,182,.4)" }}
              />
            ))}
          </div>

          {/* جدول کوچیک آخرین سفارش‌ها */}
          <div className="mt-2.5 space-y-1.5">
            {rows.map((r) => (
              <div
                key={r.name}
                className="flex items-center justify-between rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1.5"
              >
                <span className="truncate font-mono text-[9px] text-white/60 sm:text-[10px]">{r.name}</span>
                <span
                  className={`flex-shrink-0 rounded-full px-1.5 py-0.5 font-mono text-[8px] font-bold sm:text-[8.5px] ${
                    r.ok ? "bg-emerald-400/15 text-emerald-400" : "bg-accent3/15 text-accent3"
                  }`}
                >
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StoreScreen() {
  return (
    <div className="flex h-full flex-col bg-[#0a0a0c]">
      <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.03] px-3.5 py-2 sm:px-4">
        <span className="h-2 w-2 flex-shrink-0 rounded-full bg-[#ff5f56]" />
        <span className="h-2 w-2 flex-shrink-0 rounded-full bg-[#ffbd2e]" />
        <span className="h-2 w-2 flex-shrink-0 rounded-full bg-[#27c93f]" />
        <span dir="ltr" className="mx-auto flex-1 truncate rounded-full bg-white/[0.06] px-3 py-1 text-center font-mono text-[9.5px] text-white/40 sm:text-[10.5px]">
          yourstore.com
        </span>
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/5 px-4 py-2.5">
          <span className="font-mono text-[10.5px] font-bold text-white/80 sm:text-[11.5px]">فروشگاه شما</span>
          <span className="relative flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white/[0.08] text-white/70">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5">
              <path d="M3 4h2l2.4 12.4a2 2 0 002 1.6h8.4a2 2 0 002-1.6L21 8H6" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="10" cy="21" r="1.2" />
              <circle cx="17" cy="21" r="1.2" />
            </svg>
            <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-accent text-[8px] font-black text-white">
              ۳
            </span>
          </span>
        </div>

        <div className="mx-4 mt-3 rounded-lg bg-gradient-to-l from-accent/40 to-accent2/20 px-3.5 py-3.5">
          <div className="h-2 w-24 rounded-full bg-white/70" />
          <div className="mt-2 h-1.5 w-32 rounded-full bg-white/30" />
          <div className="mt-3 inline-flex h-5 items-center rounded-full bg-white/90 px-2.5 font-mono text-[8px] font-bold text-black">
            مشاهده محصولات
          </div>
        </div>

        <div className="mt-3.5 grid grid-cols-3 gap-2 px-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-md border border-white/10 bg-white/[0.03] p-1.5">
              <div
                className="aspect-square rounded"
                style={{ background: ["#0077B633", "#00B4D833", "#023E8A33"][i] }}
              />
              <div className="mt-1.5 h-1.5 w-full rounded-full bg-white/25" />
              <div className="mt-1 h-1.5 w-7 rounded-full bg-accent3/80" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AiScreen() {
  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-[#0a0a0c]">
      <svg viewBox="0 0 320 200" className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.12]">
        <circle cx="40" cy="40" r="3" fill="#48CAE4" />
        <circle cx="40" cy="110" r="3" fill="#48CAE4" />
        <circle cx="40" cy="170" r="3" fill="#48CAE4" />
        <circle cx="150" cy="70" r="3" fill="#48CAE4" />
        <circle cx="150" cy="140" r="3" fill="#48CAE4" />
        <circle cx="270" cy="100" r="3" fill="#48CAE4" />
        <path
          d="M40 40 150 70M40 110 150 70M40 110 150 140M40 170 150 140M150 70 270 100M150 140 270 100"
          stroke="#48CAE4"
          strokeWidth="1"
        />
      </svg>

      <div className="relative z-[1] flex items-center gap-2 border-b border-white/10 bg-white/[0.03] px-3.5 py-2.5 sm:px-4">
        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent3">
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
            <path d="M12 2l1.8 5.6L19.5 9l-5.7 1.4L12 16l-1.8-5.6L4.5 9l5.7-1.4L12 2Z" />
          </svg>
        </span>
        <span className="font-mono text-[10.5px] text-white/60 sm:text-[11.5px]">دستیار هوش مصنوعی</span>
        <span className="me-auto flex flex-shrink-0 items-center gap-1.5 font-mono text-[9px] text-white/35 sm:text-[10px]">
          <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-emerald-400" /> آنلاین
        </span>
      </div>

      <div className="relative z-[1] flex-1 space-y-2 overflow-hidden px-3.5 py-3 sm:px-4">
        <div className="flex justify-start">
          <div className="max-w-[78%] rounded-xl rounded-tr-sm bg-white/[0.07] px-3 py-2 text-[10.5px] leading-relaxed text-white/75 sm:text-[11.5px]">
            سلام! چطور می‌تونم امروز کمکت کنم؟
          </div>
        </div>
        <div className="flex justify-end">
          <div className="max-w-[78%] rounded-xl rounded-tl-sm bg-accent px-3 py-2 text-[10.5px] leading-relaxed text-white sm:text-[11.5px]">
            گزارش فروش این هفته رو خلاصه کن
          </div>
        </div>
        <div className="flex justify-start">
          <div className="flex items-center gap-1 rounded-xl rounded-tr-sm bg-white/[0.07] px-3 py-2.5">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/50 [animation-delay:0ms]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/50 [animation-delay:150ms]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/50 [animation-delay:300ms]" />
          </div>
        </div>
      </div>

      <div className="relative z-[1] border-t border-white/10 px-3.5 py-2.5 sm:px-4">
        <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 font-mono text-[10px] text-white/35 sm:text-[11px]">
          پیامت رو بنویس...
        </div>
      </div>
    </div>
  );
}

const screens: Record<ServiceId, ReactNode> = {
  dev: <AdminPanelScreen />,
  store: <StoreScreen />,
  ai: <AiScreen />,
};

/** The homepage's interactive "پیش‌نمایش خدمات": one laptop mockup whose
 *  screen content swaps between three fake mini-UIs, driven by the three
 *  buttons underneath it. Each tab also updates the text panel beside it
 *  (title/description/feature bullets), so the whole block — not just the
 *  screen — reflects whichever service is selected. */
export default function LaptopShowcase() {
  const [selected, setSelected] = useState<ServiceId>("dev");
  const active = services.find((s) => s.id === selected) ?? services[0];

  return (
    <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
      {/* Text panel — swaps content with the same key-based fade-in used
          for the screen, so both sides change in sync. */}
      <div key={active.id} className="order-2 animate-fade-in-up lg:order-1">
        <span
          className="mb-4 flex h-11 w-11 items-center justify-center rounded-[12px] p-2.5 transition-colors duration-500"
          style={{ background: `${active.accent}1f`, color: active.accent }}
        >
          {active.icon}
        </span>
        <h3 className="font-display text-[24px] font-normal sm:text-[28px]">{active.title}</h3>
        <p className="mt-3 max-w-[46ch] text-[14.5px] leading-relaxed text-dim">{active.desc}</p>
        <ul className="mt-5 flex flex-col gap-2.5">
          {active.bullets.map((b) => (
            <li key={b} className="flex items-start gap-2.5 text-[13.5px] text-ink/85">
              <span
                className="mt-[3px] flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full transition-colors duration-500"
                style={{ background: `${active.accent}26`, color: active.accent }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="h-2.5 w-2.5">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              {b}
            </li>
          ))}
        </ul>
        <a
          href="#contact"
          className="mt-7 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-[14px] font-bold text-canvas transition hover:-translate-y-0.5"
        >
          شروع این پروژه
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-[14px] w-[14px]">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </a>
      </div>

      {/* Laptop + tab buttons */}
      <div className="order-1 lg:order-2">
        <div className="relative mx-auto w-full max-w-[560px]">
          <span
            className="pointer-events-none absolute inset-x-0 -top-6 mx-auto h-[260px] w-[85%] rounded-full opacity-40 blur-[100px] transition-colors duration-500"
            style={{ background: active.accent }}
          />

          <div className="relative z-[1] overflow-hidden rounded-t-[16px] border-[8px] border-b-0 border-[#1a1a1e] bg-black shadow-[0_40px_90px_-25px_rgba(0,0,0,0.75)] sm:border-[10px]">
            <span className="absolute left-1/2 top-0 z-10 h-[5px] w-[64px] -translate-x-1/2 rounded-b-lg bg-[#1a1a1e]" />
            <div className="aspect-[16/10.5] w-full overflow-hidden bg-[#0a0a0c]">
              <div key={active.id} className="h-full w-full animate-fade-in-up">
                {screens[active.id]}
              </div>
            </div>
          </div>

          {/* Base — a shallow trapezoid under the screen frame, like the
              keyboard deck of a closed-screen laptop mockup. */}
          <div className="relative z-[1] mx-auto h-[13px] rounded-b-[8px] bg-gradient-to-b from-[#333338] to-[#131315] [clip-path:polygon(3%_0,97%_0,100%_100%,0%_100%)] sm:h-[16px]" />
          <div className="relative z-[1] mx-auto h-[4px] w-[40%] rounded-b-full bg-gradient-to-b from-[#131315] to-[#0a0a0c]" />
        </div>

        <div className="relative z-[1] mt-9 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {services.map((s) => {
            const isActive = s.id === active.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelected(s.id)}
                style={isActive ? ({ "--tab-color": s.accent } as CSSProperties) : undefined}
                className={`flex items-center gap-2.5 rounded-[12px] border px-4 py-3 text-right text-[13px] font-bold transition ${
                  isActive
                    ? "border-transparent bg-[var(--tab-color)] text-white shadow-glow-soft"
                    : "border-ink/[0.14] text-dim hover:border-ink/30 hover:text-ink"
                }`}
              >
                <span className={`flex h-6 w-6 flex-shrink-0 items-center justify-center ${isActive ? "text-white" : "text-dim"}`}>
                  {s.icon}
                </span>
                <span className="min-w-0 truncate">{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
