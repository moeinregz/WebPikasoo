import type { SVGProps } from "react";

/**
 * ===== آیکون‌های خطی مشترک (اصلاح این مرحله) =====
 *
 * Root Cause بخش ۳ Prompt: Header قبلاً از Emoji خام (🔍 ♡ 👤 🛍 ✕) به‌عنوان
 * آیکون استفاده می‌کرد — نه‌فقط از نظر ظاهری با برند Premium هماهنگ نیست،
 * بلکه رندر Emoji بین OS/Browser/Font مختلف ناسازگار است (اندازه، Baseline،
 * رنگ‌پذیری با currentColor ممکن نیست چون بیشتر Emoji رنگی و ثابت هستند).
 *
 * چون هیچ Icon Library‌ای در package.json نصب نیست (و افزودن یک Dependency
 * تازه بدون امکان تست نصب/Build واقعی ریسک دارد)، این‌جا یک مجموعه کوچک و
 * Self-contained از SVG خطی (Stroke-based، مشابه سبک Lucide/Feather) تعریف
 * شده — با currentColor، یعنی از همان کلاس‌های text-* رنگ می‌گیرند و در
 * Hover/Active State جدید Design System (رجوع به Button.tsx) هماهنگ‌اند.
 *
 * هر آیکون یک Component عادی React است، بدون aria-hidden پیش‌فرض — تصمیم
 * قابل مشاهده بودن برای Screen Reader (تزئینی یا معنادار) با جای استفاده
 * (Header.tsx و ...) است، نه با خود آیکون.
 */
type IconProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
};

export function SearchIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6" />
    </svg>
  );
}

export function HeartIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 20.5s-7.5-4.6-9.8-9.3C.7 7.8 2.3 4.5 5.6 4c2.1-.3 4 .8 6.4 3.2C14.4 4.8 16.3 3.7 18.4 4c3.3.5 4.9 3.8 3.4 7.2C19.5 15.9 12 20.5 12 20.5Z" />
    </svg>
  );
}

export function BagIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6 8h12l-1 12.5a1 1 0 0 1-1 .9H8a1 1 0 0 1-1-.9L6 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m6 6 12 12" />
      <path d="m18 6-12 12" />
    </svg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
