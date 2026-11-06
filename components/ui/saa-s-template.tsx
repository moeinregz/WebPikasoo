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
// screenshots instead of the template's remote images; the glow behind
// the preview is emerald. Elements keep
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


// ------------------------------------------------------------------ Hero

const PREVIEWS = [
  { src: "/work/site-mushroom-shop.webp", alt: "نمونه‌کار وب پیکاسو: فروشگاه تخصصی صنعت قارچ" },
  { src: "/work/site-novapanel.webp", alt: "نمونه‌کار وب پیکاسو: پنل مدیریت فروشگاه" },
  { src: "/work/site-market-dashboard.webp", alt: "نمونه‌کار وب پیکاسو: پلتفرم بازار بین‌المللی" },
];

export default function SaasHero() {
  return (
    <section className="relative overflow-hidden px-6 pb-16 pt-14 sm:pt-20">
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 h-[720px] bg-dot-grid [mask-image:linear-gradient(to_bottom,black,transparent)]" />

      <div className="relative z-10 mx-auto flex max-w-container flex-col items-center text-center">
        <aside
          data-hero-item
          className="mb-8 inline-flex max-w-full flex-wrap items-center justify-center gap-2 rounded-full border border-ink/15 bg-surface/60 px-4 py-2 backdrop-blur-sm"
        >
          <span className="flex items-center gap-2 whitespace-nowrap text-[12.5px] text-dim">
            <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-emerald-400" />
            آماده‌ی همکاری روی پروژه‌های جدید
          </span>
          <a href="#showcase" className="flex items-center gap-1 whitespace-nowrap text-[12.5px] font-bold text-ink transition hover:text-ink/70 active:scale-95">
            نمونه‌کارها رو ببین
            <ArrowLeft size={12} />
          </a>
        </aside>

        <div data-hero-item className="echo w-full text-center" style={echoStyle("We Build Money-Makers", 120)}>
          <EchoText en="We Build Money-Makers" />
          <h1
            className="echo-fa mx-auto max-w-[16ch] font-display text-[40px] font-normal leading-[1.3] sm:text-[58px] lg:text-[72px]"
            style={{
              backgroundImage: "linear-gradient(to bottom, rgb(var(--color-ink)), rgb(var(--color-ink)), rgb(var(--color-ink) / 0.6))",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            ما نرم‌افزار نمی‌سازیم؛
            <br />
            ابزار پول‌سازی می‌سازیم.
          </h1>
        </div>

        <p data-hero-item className="mx-auto mb-10 mt-6 max-w-[60ch] text-[15px] leading-8 text-dim sm:text-[17px]">
          برای کسب‌وکارت سایت، فروشگاه آنلاین، پنل مدیریت و نرم‌افزار اختصاصی می‌سازیم؛
          <br className="hidden sm:block" />
          چیزی که واقعاً مشتری جذب می‌کنه و می‌فروشه.
        </p>

        <div data-hero-item className="relative z-10 mb-16 flex items-center gap-4">
          <a href="#lead-form" className={buttonClasses("gradient", "lg", "rounded-lg")} aria-label="درخواست مشاوره‌ی رایگان">
            مشاوره‌ی رایگان پروژه من
          </a>
        </div>

        {/* product preview: three real project mockups (all sizes), lit from
            behind by an emerald light — a bright core, a wide bloom and soft
            rays fanning out from behind the cards */}
        <div id="work" data-hero-item className="relative w-full max-w-5xl scroll-mt-[90px] pb-6">
          <div aria-hidden className="pointer-events-none absolute left-1/2 top-[16%] z-0 h-[170%] w-[170%] -translate-x-1/2 -translate-y-1/2 sm:h-[150%] sm:w-[130%]">
            {/* rays */}
            <div
              className="absolute inset-0 animate-[spin_80s_linear_infinite]"
              style={{
                background: "repeating-conic-gradient(from 0deg at 50% 50%, rgba(52,211,153,0.42) 0deg 2.5deg, transparent 2.5deg 9deg)",
                maskImage: "radial-gradient(circle at 50% 50%, black 0%, rgba(0,0,0,0.7) 18%, transparent 46%)",
                WebkitMaskImage: "radial-gradient(circle at 50% 50%, black 0%, rgba(0,0,0,0.7) 18%, transparent 46%)",
              }}
            />
            {/* bloom */}
            <div className="absolute left-1/2 top-1/2 h-[40%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-[100%] bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.85)_0%,rgba(16,185,129,0.35)_35%,transparent_70%)] blur-2xl" />
            {/* hot core */}
            <div className="absolute left-1/2 top-1/2 h-[12%] w-[36%] -translate-x-1/2 -translate-y-1/2 rounded-[100%] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,1)_0%,rgba(167,243,208,0.85)_30%,rgba(16,185,129,0.4)_55%,transparent_75%)] blur-md" />
          </div>

          <div className="relative z-10 mx-auto flex items-center justify-center py-[6%]">
            <PreviewCard {...PREVIEWS[0]} className="absolute right-0 top-[14%] w-[40%] rotate-[8deg] opacity-90 sm:w-[34%] sm:translate-x-[-4%] sm:rotate-[7deg]" />
            <PreviewCard {...PREVIEWS[2]} className="absolute left-0 top-[14%] w-[40%] -rotate-[8deg] opacity-90 sm:w-[34%] sm:translate-x-[4%] sm:-rotate-[7deg]" />
            <PreviewCard {...PREVIEWS[1]} priority lit className="relative z-10 w-[58%] sm:w-[48%]" />
          </div>
        </div>
      </div>
    </section>
  );
}

function PreviewCard({ src, alt, className = "", priority = false, lit = false }: { src: string; alt: string; className?: string; priority?: boolean; lit?: boolean }) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border bg-surface p-1 shadow-2xl shadow-black/60 sm:p-1.5 ${
        lit ? "border-emerald-300/30 shadow-[0_0_60px_-10px_rgba(16,185,129,0.55)]" : "border-ink/15"
      } ${className}`}
    >
      {lit && <div aria-hidden className="absolute inset-x-[15%] top-0 z-10 h-px bg-gradient-to-r from-transparent via-emerald-200 to-transparent" />}
      <Image src={src} alt={alt} width={1254} height={1254} priority={priority} sizes="(min-width: 640px) 48vw, 58vw" className="h-auto w-full rounded-xl" />
    </div>
  );
}
