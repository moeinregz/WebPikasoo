import type { ReactNode } from "react";
import Link from "next/link";
import Reveal from "./Reveal";
import StatCounter from "./StatCounter";
import LaptopShowcase from "./LaptopShowcase";
import EchoHeading from "@/components/EchoHeading";

function GroupHead({
  num,
  title,
  icon,
  big = false,
}: {
  num: string;
  title: string;
  icon: ReactNode;
  big?: boolean;
}) {
  return (
    <div className="mb-6 flex items-center gap-3.5">
      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center btn-blood rounded-md font-mono text-[13px] font-black">
        {num}
      </span>
      <h3
        className={
          big
            ? "font-display text-[28px] font-normal sm:text-[34px] lg:text-[38px]"
            : "font-display text-[22px] font-normal"
        }
      >
        {title}
      </h3>
      <span className="h-px flex-1 bg-ink/10" />
      <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-blood-hi/30 bg-blood/[0.08] p-2 text-blood-hi">
        {icon}
      </span>
    </div>
  );
}

/** Homepage "خدمات" (services) section — the 4 things WebPIKASO actually
 *  sells. The first three (software development, store/corporate sites,
 *  AI) share one interactive laptop mockup: pick a tab, the screen and the
 *  text beside it both switch to that service. SEO keeps its original
 *  design as the 4th service. A link at the end points to /skills for
 *  anyone who wants the full technical breakdown. */
export default function Services() {
  return (
    <section id="skills" className="relative scroll-mt-[90px] overflow-hidden border-t border-ink/10 py-[110px]">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[520px] bg-dot-grid" />

      <div className="relative z-[1] mx-auto max-w-container px-6">
        <Reveal className="mb-14">
          <div>
            <EchoHeading en="Services" className="font-display text-[32px] font-normal leading-[1.3] sm:text-[40px] lg:text-[50px]">
              خدمات
            </EchoHeading>
            <p className="mt-2.5 max-w-[60ch] text-[15px] text-dim">
              توسعه نرم‌افزار، طراحی سایت فروشگاهی و شرکتی، هوش مصنوعی و سئو — چهار خدمتی که تیم وب
              پیکاسو زیر یه سقف ارائه می‌ده.
            </p>
          </div>
        </Reveal>

        {/* 01–03 — Software dev / Store & corporate sites / AI, shown
            through one interactive laptop preview. */}
        <Reveal className="relative z-[1] mb-20">
          <div data-gsap="zoom">
            <LaptopShowcase />
          </div>
        </Reveal>

        {/* 04 — SEO & Growth */}
        <Reveal className="relative z-[1] mb-14">
          <GroupHead
            num="SEO"
            title="سئو و رشد"
            big
            icon={
              <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-full w-full">
                <path d="M8 34 L18 24 L26 30 L40 12" strokeWidth={2.2} />
                <path d="M30 12h10v10" strokeWidth={2.2} />
              </svg>
            }
          />

          {/* پنل اصلی — همیشه تم تیره (مثل ترمینال هیرو)، با یه گلوی
              چرخان پشت‌زمینه، عنوان با گرادیان متحرک، سه شمارنده‌ی
              انیمیشنی که با اسکرول به داخل ویوپورت شمردن رو شروع می‌کنن،
              و یه نمودار SVG با خط درخشان + نقطه‌ای که دائم روی مسیرش
              حرکت می‌کنه. */}
          {/* Fixed opaque dark background (not bg-black/40) — a semi-
              transparent black blends with whatever's BEHIND it, so in
              light mode (white canvas) it rendered as a washed-out gray
              box instead of the intended dark glass panel, and the
              white/45–white/70 text above lost most of its contrast
              against that gray. A solid dark color stays dark regardless
              of theme, matching the other "always dark" panels in this
              codebase (Contact's CTA, the laptop mockup, etc). */}
          <div id="seo" className="seo-hero relative scroll-mt-[90px] overflow-hidden rounded-card border border-blood-hi/20 bg-[#0b0b0d] p-6 sm:p-9">
            <div className="relative z-[1] flex flex-col gap-9 lg:flex-row lg:items-center">
              <div className="flex-1">
                <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-white/70">
                  <span className="h-1.5 w-1.5 flex-shrink-0 animate-pulse-dot rounded-full bg-blood-hi shadow-[0_0_8px_rgb(var(--color-blood-hi))]" />
                  رشد فعال و پیوسته
                </span>
                <h3 className="accent-gradient-text max-w-[16ch] font-display text-[30px] font-normal leading-[1.25] sm:text-[36px] lg:text-[40px]">
                  سئویی که هر ماه یه پله بالاتر می‌بره
                </h3>
                <p className="mt-3.5 max-w-[46ch] text-[14.5px] leading-relaxed text-white/55">
                  نتیجه‌ی سئو یه شب اتفاق نمی‌افته؛ کاریه که هر ماه رتبه، ترافیک و اعتبار دامنه رو
                  قدم‌به‌قدم بالا می‌بره.
                </p>

                <div className="mt-8 grid grid-cols-3 gap-3 border-t border-white/10 pt-6 sm:gap-6">
                  <div>
                    <div className="font-display text-[24px] font-normal text-white sm:text-[30px]">
                      <StatCounter to={240} suffix="%+" />
                    </div>
                    <div className="mt-1 font-mono text-[10.5px] leading-relaxed text-white/45 sm:text-[11px]">
                      رشد ترافیک ارگانیک
                    </div>
                  </div>
                  <div>
                    <div className="font-display text-[24px] font-normal text-white sm:text-[30px]">
                      <StatCounter to={50} prefix="+" />
                    </div>
                    <div className="mt-1 font-mono text-[10.5px] leading-relaxed text-white/45 sm:text-[11px]">
                      کلمه‌ی کلیدی صفحه‌ی اول
                    </div>
                  </div>
                  <div>
                    <div className="font-display text-[24px] font-normal text-white sm:text-[30px]">
                      <StatCounter to={6} suffix=" ماه" />
                    </div>
                    <div className="mt-1 font-mono text-[10.5px] leading-relaxed text-white/45 sm:text-[11px]">
                      میانگین رسیدن به نتیجه
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0 lg:w-[360px]">
                <svg viewBox="0 0 380 200" fill="none" className="w-full">
                  <defs>
                    <linearGradient id="seoAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" style={{ stopColor: "rgb(var(--color-blood-hi))" }} stopOpacity="0.55" />
                      <stop offset="60%" style={{ stopColor: "rgb(var(--color-blood))" }} stopOpacity="0.15" />
                      <stop offset="100%" style={{ stopColor: "rgb(var(--color-blood))" }} stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="seoLineGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#5e0612" />
                      <stop offset="55%" style={{ stopColor: "rgb(var(--color-blood-hi))" }} />
                      <stop offset="100%" stopColor="#c8203a" />
                    </linearGradient>
                  </defs>

                  {[40, 80, 120, 160].map((y) => (
                    <line key={y} x1="0" y1={y} x2="380" y2={y} stroke="rgba(255,255,255,.07)" strokeWidth="1" />
                  ))}

                  <path
                    d="M20,150 C55,150 65,138 95,130 C125,122 135,105 165,96 C195,87 205,66 235,55 C260,46 275,36 300,28 C320,22 335,18 355,14 L355,190 L20,190 Z"
                    fill="url(#seoAreaGrad)"
                  />
                  <path
                    className="seo-chart-line"
                    d="M20,150 C55,150 65,138 95,130 C125,122 135,105 165,96 C195,87 205,66 235,55 C260,46 275,36 300,28 C320,22 335,18 355,14"
                    stroke="url(#seoLineGrad)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />

                  {/* milestones along the curve */}
                  {[
                    [95, 130, "rgb(var(--color-blood-hi))"],
                    [165, 96, "rgb(var(--color-blood-hi))"],
                    [235, 55, "rgb(var(--color-blood-hi))"],
                  ].map(([cx, cy, c], i) => (
                    <g key={i}>
                      <circle cx={cx} cy={cy} r="9" opacity="0.18" style={{ fill: c as string }}>
                        <animate attributeName="r" values="6;11;6" dur="2.4s" begin={`${i * 0.4}s`} repeatCount="indefinite" />
                      </circle>
                      <circle cx={cx} cy={cy} r="4" fill="#0b0b0d" strokeWidth="2.5" style={{ stroke: c as string }} />
                    </g>
                  ))}

                  <circle cx="355" cy="14" r="10" opacity="0.3" style={{ fill: "rgb(var(--color-blood-hi))" }}>
                    <animate attributeName="r" values="6;14;6" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values=".45;0;.45" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="355" cy="14" r="5" fill="#fff" strokeWidth="3" style={{ stroke: "rgb(var(--color-blood-hi))" }} />
                  <g transform="translate(296 34)">
                    <rect width="62" height="22" rx="11" fillOpacity="0.9" style={{ fill: "rgb(var(--color-blood))" }} />
                    <text x="31" y="15" textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff" fontFamily="monospace">+240%</text>
                  </g>

                  <circle r="5" fill="#fff" className="seo-chart-dot">
                    <animateMotion
                      dur="5s"
                      repeatCount="indefinite"
                      path="M20,150 C55,150 65,138 95,130 C125,122 135,105 165,96 C195,87 205,66 235,55 C260,46 275,36 300,28 C320,22 335,18 355,14"
                    />
                  </circle>
                </svg>
              </div>
            </div>
          </div>

        </Reveal>

        {/* Points to the dedicated skills page for the full technical list —
            the pretty per-technology cards that used to live in this
            section now live there instead. */}
        <Reveal className="relative z-[1] flex flex-wrap items-center justify-between gap-4 rounded-card border border-ink/10 bg-surface/70 p-6 transition-colors hover:border-blood-hi/35 sm:p-7">
          <div>
            <h4 className="text-[16px] font-bold">کنجکاوید با چه تکنولوژی‌هایی کار می‌کنیم؟</h4>
            <p className="mt-1.5 text-[13.5px] text-dim">
              فهرست کامل مهارت‌های فنی تیم — فرانت‌اند، بک‌اند، وردپرس و هوش مصنوعی.
            </p>
          </div>
          <Link
            href="/skills"
            className="btn-blood inline-flex flex-shrink-0 items-center gap-2 rounded-xl px-5 py-3 text-[14px] font-bold active:scale-95"
          >
            مشاهده مهارت‌های فنی
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-[15px] w-[15px]">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
