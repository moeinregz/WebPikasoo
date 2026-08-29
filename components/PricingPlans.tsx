"use client";

import { useState } from "react";
import Link from "next/link";
import Reveal from "./Reveal";

type Plan = {
  name: string;
  price: string;
  unit: string;
  features: string[];
  highlight?: boolean;
};

type Category = {
  slug: string;
  label: string;
  shortLabel: string;
  desc: string;
  color: string;
  plans: Plan[];
};

const categories: Category[] = [
  {
    slug: "seo",
    label: "سئو و رشد ارگانیک",
    shortLabel: "سئو",
    desc: "بهینه‌سازی داخلی، تولید محتوا و لینک‌سازی برای رشد پیوسته‌ی رتبه و ترافیک ارگانیک.",
    color: "#00B4D8",
    plans: [
      {
        name: "پایه",
        price: "از 15",
        unit: "میلیون تومان / ماه",
        features: [
          "تحقیق و انتخاب کلمات کلیدی",
          "سئوی داخلی صفحات اصلی سایت",
          "بهینه‌سازی پایه‌ی سرعت و ساختار",
          "گزارش ماهانه‌ی وضعیت رتبه",
        ],
      },
      {
        name: "حرفه‌ای",
        price: "از 32",
        unit: "میلیون تومان / ماه",
        features: [
          "سئوی داخلی کامل تمام صفحات",
          "تولید محتوای بهینه (۴ مقاله در ماه)",
          "لینک‌سازی داخلی و خارجی پایه",
          "بهینه‌سازی تکنیکال و سرعت",
          "گزارش تحلیلی ماهانه + مشاوره",
        ],
        highlight: true,
      },
      {
        name: "رقابتی / سازمانی",
        price: "قیمت  توافقی ",
        unit: "بسته به حوزه‌ی رقابتی",
        features: [
          "استراتژی سئوی رقابتی اختصاصی",
          "لینک‌سازی خارجی حرفه‌ای",
          "سئوی محلی و بین‌المللی",
          "بهینه‌سازی مستمر فنی سایت",
          "تیم اختصاصی و گزارش هفتگی",
        ],
      },
    ],
  },
  {
    slug: "wordpress",
    label: "طراحی سایت وردپرسی",
    shortLabel: "وردپرس",
    desc: "طراحی و توسعه‌ی وب‌سایت روی وردپرس — از سایت معرفی شرکتی تا فروشگاه کامل ووکامرس.",
    color: "#0077B6",
    plans: [
      {
        name: "استارتاپ",
        price: "از 25",
        unit: "میلیون تومان",
        features: [
          "قالب اختصاصی و سفارشی‌سازی‌شده",
          "تا ۵ صفحه‌ی اختصاصی",
          "نصب و تنظیم پلاگین‌های ضروری",
          "طراحی کاملاً واکنش‌گرا",
          "۱ ماه پشتیبانی رایگان",
        ],
      },
      {
        name: "کسب‌وکار",
        price: "از 38",
        unit: "میلیون تومان",
        features: [
          "طراحی UI اختصاصی روی وردپرس",
          "تا ۱۲ صفحه‌ی اختصاصی",
          "امکان افزودن فروشگاه ووکامرس",
          "سئوی داخلی و بهینه‌سازی سرعت",
          "۳ ماه پشتیبانی رایگان",
        ],
        highlight: true,
      },
      {
        name: "فروشگاهی",
        price: "از 47",
        unit: "میلیون تومان",
        features: [
          "فروشگاه کامل با ووکامرس",
          "درگاه پرداخت و مدیریت موجودی",
          "صفحات و محصولات نامحدود",
          "آموزش کامل مدیریت سایت",
          "۶ ماه پشتیبانی رایگان",
        ],
      },
    ],
  },
  {
    slug: "coding",
    label: "سایت کدنویسی اختصاصی",
    shortLabel: "کدنویسی",
    desc: "طراحی و توسعه‌ی وب‌سایت با کدنویسی اختصاصی (بدون قالب آماده)، برای سرعت و انعطاف بیشتر.",
    color: "#023E8A",
    plans: [
      {
        name: "پایه",
        price: "از 58",
        unit: "میلیون تومان",
        features: [
          "کدنویسی اختصاصی با Next.js / React",
          "طراحی UI/UX سفارشی",
          "تا ۶ صفحه‌ی اختصاصی",
          "بهینه برای سرعت و سئو",
          "۱ ماه پشتیبانی رایگان",
        ],
      },
      {
        name: "پیشرفته",
        price: "از 84",
        unit: "میلیون تومان",
        features: [
          "فرانت‌اند و بک‌اند اختصاصی",
          "دیتابیس و پنل مدیریت محتوا",
          "سیستم ثبت‌نام و احراز هویت کاربران",
          "یکپارچه‌سازی با API و سرویس‌های بیرونی",
          "۳ ماه پشتیبانی رایگان",
        ],
        highlight: true,
      },
      {
        name: "اختصاصی / سازمانی",
        price: "قیمت توافقی ",
        unit: "بسته به نیاز پروژه",
        features: [
          "معماری مقیاس‌پذیر (Next.js + Node/Mongo)",
          "پشتیبانی از چند نقش کاربری",
          "تست و بهینه‌سازی امنیتی",
          "دیپلوی حرفه‌ای و CI/CD",
          "پشتیبانی و SLA اختصاصی",
        ],
      },
    ],
  },
  {
    slug: "software",
    label: "توسعه نرم‌افزار و پنل مدیریت",
    shortLabel: "نرم‌افزار",
    desc: "طراحی و توسعه‌ی انواع نرم‌افزار تحت وب، پنل‌های مدیریتی و سیستم‌های داخلی سفارشی.",
    color: "#03045E",
    plans: [
      {
        name: "پنل ساده",
        price: "از 82",
        unit: "میلیون تومان",
        features: [
          "پنل مدیریت تک‌کاربره",
          "مدیریت محتوا / محصولات",
          "گزارش‌گیری و آمار پایه",
          "طراحی داشبورد ساده و کاربردی",
          "۱ ماه پشتیبانی رایگان",
        ],
      },
      {
        name: "پنل حرفه‌ای",
        price: "از 178",
        unit: "میلیون تومان",
        features: [
          "چند نقش کاربری (ادمین/کارمند/مشتری)",
          "مدیریت سفارش، فاکتور و پرداخت",
          "نمودار و گزارش‌گیری پیشرفته",
          "اتصال به دیتابیس اختصاصی",
          "۳ ماه پشتیبانی رایگان",
        ],
        highlight: true,
      },
      {
        name: "سیستم سازمانی",
        price: "قیمت توافقی ",
        unit: "بسته به مقیاس پروژه",
        features: [
          "معماری مقیاس‌پذیر و چندبخشی",
          "یکپارچه‌سازی با سیستم‌های دیگر (API)",
          "مدیریت دسترسی سطح‌بندی‌شده",
          "اتوماسیون فرایندهای داخلی",
          "پشتیبانی و SLA اختصاصی",
        ],
      },
    ],
  },
];

export default function PricingPlans() {
  const [active, setActive] = useState(categories[0].slug);
  const cat = categories.find((c) => c.slug === active) ?? categories[0];

  return (
    <div>
      {/* تب‌های دسته‌بندی */}
      <div className="mb-10 flex flex-wrap items-center justify-center gap-2.5">
        {categories.map((c) => (
          <button
            key={c.slug}
            type="button"
            onClick={() => setActive(c.slug)}
            className={`rounded-full border px-5 py-2.5 text-[13.5px] font-bold transition ${
              active === c.slug
                ? "border-transparent text-white shadow-glow"
                : "border-ink/15 bg-surface/40 text-dim hover:border-ink/25 hover:text-ink"
            }`}
            style={active === c.slug ? { background: c.color } : undefined}
          >
            {c.shortLabel}
          </button>
        ))}
      </div>

      <Reveal key={cat.slug} className="mb-9 text-center">
        <h3 className="font-display text-[22px] font-normal sm:text-2xl">{cat.label}</h3>
        <p className="mx-auto mt-2 max-w-[56ch] text-[13.5px] text-dim">{cat.desc}</p>
      </Reveal>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {cat.plans.map((p, i) => (
          <Reveal key={`${cat.slug}-${p.name}`} delay={i * 80}>
            <div
              className={`relative flex h-full flex-col rounded-card border p-7 ${
                p.highlight ? "shadow-glow-soft" : "border-ink/10 bg-surface/50"
              }`}
              style={
                p.highlight
                  ? { borderColor: `${cat.color}80`, background: `${cat.color}12` }
                  : undefined
              }
            >
              {p.highlight && (
                <span
                  className="absolute -top-3 right-7 rounded-full px-3 py-1 font-mono text-[11px] font-bold text-white"
                  style={{ background: cat.color }}
                >
                  پیشنهادی
                </span>
              )}
              <h4 className="mb-1.5 font-display text-lg font-normal">{p.name}</h4>
              <div className="mb-6 mt-2">
                <span className="font-display text-[26px] font-normal text-ink">{p.price}</span>
                <span className="mr-1.5 text-[13px] text-dim">{p.unit}</span>
              </div>
              <ul className="mb-7 flex flex-1 flex-col gap-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[13.5px] text-ink/85">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={cat.color}
                      strokeWidth={2.5}
                      className="mt-0.5 h-4 w-4 flex-shrink-0"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={`/order?category=${encodeURIComponent(cat.slug)}&plan=${encodeURIComponent(
                  p.name
                )}#order-form`}
                scroll={true}
                className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-[14px] font-bold transition ${
                  p.highlight
                    ? "text-white shadow-glow hover:-translate-y-0.5"
                    : "border border-ink/15 bg-canvas text-ink hover:border-accent hover:text-accent"
                }`}
                style={p.highlight ? { background: cat.color } : undefined}
              >
                انتخاب این پلن
              </Link>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
