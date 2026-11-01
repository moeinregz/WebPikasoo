import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "accent" | "secondary" | "ghost" | "outlineInverse" | "solidInverse";
type Size = "sm" | "md" | "lg";

// ===== بازطراحی «جعبه شیرینی» =====
// هر دکمه حاشیه ضخیم + سایه سخت اپک دارد؛ با Hover کمی بالا می‌آید و سایه
// بزرگ‌تر می‌شود، با فشردن (active) روی سایه‌اش «فرو می‌رود» — حس دکمه فیزیکی.
const lift =
  "border-2 shadow-hard-sm hover:-translate-y-0.5 hover:translate-x-0.5 hover:shadow-hard active:translate-y-0.5 active:-translate-x-0.5 active:shadow-none";

const variantClasses: Record<Variant, string> = {
  primary: `${lift} border-brand-black bg-brand-black text-text-inverse hover:bg-cocoa-light`,
  accent: `${lift} border-brand-black bg-brand-red text-white hover:bg-brand-redDark`,
  secondary: `${lift} border-brand-black bg-surface text-brand-black hover:bg-honey`,
  ghost: "border-2 border-transparent bg-transparent text-brand-black hover:border-brand-black hover:bg-honey-light",
  // دو Variant برای پس‌زمینه‌های تیره/رنگی — هیچ‌جا با className سفارشی رنگ
  // Override نمی‌شوند (دلیل: رقابت دو Utility هم‌وزن روی یک ویژگی، رجوع به
  // تاریخچه این فایل).
  outlineInverse:
    "border-2 border-cream bg-transparent text-cream shadow-[-3px_3px_0_0_#DFA03F] hover:-translate-y-0.5 hover:translate-x-0.5 hover:bg-cream hover:text-brand-black hover:shadow-[-6px_6px_0_0_#DFA03F] active:translate-y-0.5 active:shadow-none",
  solidInverse:
    "border-2 border-brand-black bg-cream text-brand-black shadow-hard hover:-translate-y-0.5 hover:translate-x-0.5 hover:bg-honey hover:shadow-hard-lg active:translate-y-0.5 active:shadow-none",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-10 px-4 text-btn",
  md: "h-12 px-6 text-btn",
  lg: "h-14 px-8 text-[16px] font-bold",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  fullWidthOnMobile?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  children,
  fullWidthOnMobile = false,
  className = "",
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-primary font-semibold transition-[transform,box-shadow,background-color,color] duration-200 ease-out disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none ${
        variantClasses[variant]
      } ${sizeClasses[size]} ${fullWidthOnMobile ? "w-full tablet:w-auto" : ""} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
