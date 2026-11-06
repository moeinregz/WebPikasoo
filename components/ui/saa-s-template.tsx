import React from "react";
import Image from "next/image";
import { EchoText, echoStyle } from "@/components/EchoHeading";

// Hero adapted from the "SaaS template" landing component (21st.dev):
// centered announcement pill, gradient headline, subtitle, a gradient CTA
// and a large product preview with a glow behind it. Changes for this
// site: Persian/RTL copy, the site's theme tokens (matte black, off-white,
// off-white) instead of fixed black/white, the site's own Nav instead of the
// template's English navigation, no global Poppins override (it would
// replace the Persian font everywhere), and the team's real project
// mockups instead of the template's remote dashboard image. Elements keep
// data-hero-item so the intro animation (fx/IntroSplash) still runs.

// ---------------------------------------------------------------- Button

type Variant = "default" | "secondary" | "ghost" | "gradient";
type Size = "default" | "sm" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:pointer-events-none disabled:opacity-50";
const variants: Record<Variant, string> = {
  default: "bg-ink text-canvas hover:bg-ink/90",
  secondary: "bg-surface text-ink border border-ink/15 hover:bg-ink/10",
  ghost: "text-ink hover:bg-ink/10",
  gradient: "bg-gradient-to-b from-ink via-ink/95 to-ink/60 text-canvas hover:scale-105 active:scale-95",
};
const sizes: Record<Size, string> = {
  default: "h-10 px-4 py-2 text-sm",
  sm: "h-10 px-5 text-sm",
  lg: "h-12 px-8 text-[15px]",
};

/** Same classes as <Button>, for links that should look like one. */
export function buttonClasses(variant: Variant = "default", size: Size = "default", className = "") {
  return `${base} ${variants[variant]} ${sizes[size]} ${className}`;
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "default", size = "default", className = "", children, ...props }, ref) => (
    <button ref={ref} className={buttonClasses(variant, size, className)} {...props}>
      {children}
    </button>
  )
);
Button.displayName = "Button";

// ----------------------------------------------------------------- Icons

const ArrowLeft = ({ className = "", size = 16 }: { className?: string; size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 12H5" />
    <path d="m12 19-7-7 7-7" />
  </svg>
);

const Check = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);

// ------------------------------------------------------------------ Hero

const PREVIEWS = [
  { src: "/work/site-mushroom-shop.webp", alt: "نمونه‌کار وب پیکاسو: فروشگاه تخصصی صنعت قارچ" },
  { src: "/work/site-novapanel.webp", alt: "نمونه‌کار وب پیکاسو: پنل مدیریت فروشگاه" },
  { src: "/work/site-market-dashboard.webp", alt: "نمونه‌کار وب پیکاسو: پلتفرم بازار بین‌المللی" },
];

const POINTS = ["بدون هزینه‌ی پنهان", "سایت نتیجه‌محور", "۳ ماه پشتیبانی رایگان"];

export default function SaasHero() {
  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-14 sm:pt-20">
      {/* background: dot grid + a faint light glow at the top */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 h-[720px] bg-dot-grid [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-[-220px] z-0 h-[520px] w-[900px] max-w-[160vw] -translate-x-1/2 rounded-full bg-ink/[0.07] blur-[120px]" />

      <div className="relative z-10 mx-auto flex max-w-container flex-col items-center text-center">
        <aside
          data-hero-item
          className="mb-8 inline-flex max-w-full flex-wrap items-center justify-center gap-2 rounded-full border border-ink/15 bg-surface/60 px-4 py-2 backdrop-blur-sm"
        >
          <span className="flex items-center gap-2 whitespace-nowrap text-[12.5px] text-dim">
            <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-accent3" />
            آماده‌ی همکاری روی پروژه‌های جدید
          </span>
          <a href="#showcase" className="flex items-center gap-1 whitespace-nowrap text-[12.5px] font-bold text-ink transition hover:text-accent active:scale-95">
            نمونه‌کارها رو ببین
            <ArrowLeft size={12} />
          </a>
        </aside>

        <div data-hero-item className="echo w-full text-center" style={echoStyle("We Build Money-Makers", 120)}>
          <EchoText en="We Build Money-Makers" />
          <h1
            className="echo-fa mx-auto max-w-[16ch] font-display text-[40px] font-normal leading-[1.3] sm:text-[58px] lg:text-[72px]"
            style={{
              backgroundImage: "linear-gradient(to bottom, rgb(var(--color-ink)), rgb(var(--color-ink)) 55%, rgb(var(--color-ink) / 0.62))",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            ما نرم‌افزار نمی‌سازیم؛
            <br />
            <span
              className="mx-1 inline-block -rotate-1 rounded-xl px-3 leading-[1.25]"
              style={{
                background: "rgb(var(--color-ink))",
                WebkitTextFillColor: "rgb(var(--color-canvas))",
                color: "rgb(var(--color-canvas))",
              }}
            >
              ابزار پول‌سازی
            </span>{" "}
            می‌سازیم.
          </h1>
        </div>

        <p data-hero-item className="mx-auto mb-9 mt-6 max-w-[60ch] text-[15px] leading-8 text-dim sm:text-[17px]">
          برای کسب‌وکارت <b className="font-semibold text-ink">سایت، فروشگاه آنلاین، پنل مدیریت و نرم‌افزار اختصاصی</b> می‌سازیم؛ چیزی که
          واقعاً مشتری جذب می‌کنه و می‌فروشه، نه فقط تو دمو خوب به‌نظر می‌رسه.
        </p>

        <div data-hero-item className="mb-5 flex flex-wrap items-center justify-center gap-3">
          <a href="#lead-form" className={buttonClasses("gradient", "lg")} aria-label="درخواست مشاوره‌ی رایگان">
            مشاوره‌ی رایگان پروژه من
            <ArrowLeft size={16} />
          </a>
          <a href="#showcase" className={buttonClasses("secondary", "lg")}>
            نمونه‌کارهای مشابه کسب‌وکارم
          </a>
        </div>

        <ul data-hero-item className="mb-16 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px] text-dim">
          {POINTS.map((p) => (
            <li key={p} className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-accent" />
              {p}
            </li>
          ))}
        </ul>

        {/* product preview: three real project mockups, the middle one in front */}
        <div id="work" data-hero-item className="relative w-full max-w-5xl scroll-mt-[90px]">
          <div aria-hidden className="pointer-events-none absolute left-1/2 top-[8%] z-0 h-[70%] w-[80%] -translate-x-1/2 rounded-full bg-ink/[0.10] blur-[90px]" />
          <div className="relative z-10 mx-auto flex items-center justify-center">
            <PreviewCard {...PREVIEWS[0]} className="absolute right-0 top-[12%] w-[40%] rotate-[8deg] opacity-80 sm:top-[10%] sm:w-[34%] sm:translate-x-[-4%] sm:rotate-[7deg]" />
            <PreviewCard {...PREVIEWS[2]} className="absolute left-0 top-[12%] w-[40%] -rotate-[8deg] opacity-80 sm:top-[10%] sm:w-[34%] sm:translate-x-[4%] sm:-rotate-[7deg]" />
            <PreviewCard {...PREVIEWS[1]} priority className="relative z-10 w-[58%] sm:w-[48%]" />
          </div>
        </div>
      </div>
    </section>
  );
}

function PreviewCard({ src, alt, className = "", priority = false }: { src: string; alt: string; className?: string; priority?: boolean }) {
  return (
    <div className={`overflow-hidden rounded-2xl border border-ink/15 bg-surface p-1.5 shadow-2xl shadow-black/40 ${className}`}>
      <Image src={src} alt={alt} width={1254} height={1254} priority={priority} sizes="(min-width: 640px) 48vw, 58vw" className="h-auto w-full rounded-xl" />
    </div>
  );
}
