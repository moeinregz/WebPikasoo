"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Reveal from "./Reveal";
import { submitPlanOrder } from "@/app/actions";

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

// همون نگاشتی که قبلاً تو app/order/page.tsx برای پیش‌پرکردن فرم بود —
// حالا مستقیم همینجا لازمه چون خود دکمه‌ی هر پلن سفارش رو می‌سازه و می‌فرسته.
const categoryToProjectType: Record<string, string> = {
  seo: "سئو",
  wordpress: "وب‌سایت وردپرسی",
  coding: "سایت کدنویسی اختصاصی",
  software: "پنل مدیریت / توسعه نرم‌افزار",
};

type OrderStatus = "idle" | "sending" | "sent" | "error";

/** یه سفارش پلن رو یکتا شناسایی می‌کنه — برای نگه‌داشتن وضعیت هر کارت
 *  جدا از بقیه و برای تشخیص «همین پلن، از روی URL، بعد از ورود/ثبت‌نام
 *  باید خودکار ثبت بشه» یا نه. */
function planKey(categorySlug: string, planName: string) {
  return `${categorySlug}::${planName}`;
}

export default function PricingPlans({
  isLoggedIn,
  autoOrderCategory,
  autoOrderPlan,
}: {
  isLoggedIn: boolean;
  /** از query استرینگ صفحه‌ی /order — یعنی کاربر همین الان از صفحه‌ی
   *  ورود/ثبت‌نام برگشته و قبلاً همین پلن رو زده بود، پس دیگه لازم نیست
   *  دوباره کلیک کنه؛ خودمون براش می‌فرستیم. */
  autoOrderCategory?: string;
  autoOrderPlan?: string;
} = { isLoggedIn: false }) {
  const [active, setActive] = useState(autoOrderCategory ?? categories[0].slug);
  const cat = categories.find((c) => c.slug === active) ?? categories[0];

  const [isPending, startTransition] = useTransition();
  const [statuses, setStatuses] = useState<Record<string, OrderStatus>>({});
  const [errorMessages, setErrorMessages] = useState<Record<string, string>>({});
  // فقط یه‌بار، برای جلوگیری از ثبت تکراری اگه کامپوننت دوباره رندر بشه.
  const autoOrderFired = useRef(false);

  // وقتی کاربر لاگین نیست و روی «درخواست این پلن» می‌زنه، هیچ ثبت‌نامی
  // لازم نیست — فقط یه مودال کوچیک اسم + شماره می‌گیره (Micro-Commitment)
  // و همون‌جا درخواست ثبت می‌شه.
  const [guestPromptPlan, setGuestPromptPlan] = useState<{ cat: Category; plan: Plan } | null>(
    null
  );
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  // بعد از ثبت موفق درخواست یه نوتیف وسط صفحه نشون داده می‌شه.
  const [successPlan, setSuccessPlan] = useState<{ cat: Category; plan: Plan } | null>(null);

  function placeOrder(c: Category, p: Plan, guest?: { name: string; phone: string }) {
    const key = planKey(c.slug, p.name);
    setStatuses((s) => ({ ...s, [key]: "sending" }));
    startTransition(async () => {
      const result = await submitPlanOrder({
        categoryLabel: c.label,
        categoryProjectType: categoryToProjectType[c.slug] ?? c.label,
        planName: p.name,
        planPrice: p.price,
        planUnit: p.unit,
        planFeatures: p.features,
        guestName: guest?.name,
        guestPhone: guest?.phone,
      });
      if (result?.ok) {
        setStatuses((s) => ({ ...s, [key]: "sent" }));
        setSuccessPlan({ cat: c, plan: p });
      } else {
        setStatuses((s) => ({ ...s, [key]: "error" }));
        setErrorMessages((m) => ({ ...m, [key]: result?.message || "یه مشکلی پیش اومد." }));
      }
    });
  }

  function submitGuestOrder() {
    if (!guestPromptPlan || !guestName.trim() || !guestPhone.trim()) return;
    placeOrder(guestPromptPlan.cat, guestPromptPlan.plan, {
      name: guestName.trim(),
      phone: guestPhone.trim(),
    });
    setGuestPromptPlan(null);
    setGuestName("");
    setGuestPhone("");
  }

  // برگشت از /account بعد از ورود یا ثبت‌نام (لینک قدیمی‌تر که هنوز ممکنه
  // جایی استفاده بشه): همون پلن رو خودکار درخواست بده.
  useEffect(() => {
    if (autoOrderFired.current) return;
    if (!isLoggedIn || !autoOrderCategory || !autoOrderPlan) return;
    const c = categories.find((x) => x.slug === autoOrderCategory);
    const p = c?.plans.find((x) => x.name === autoOrderPlan);
    if (!c || !p) return;
    autoOrderFired.current = true;
    placeOrder(c, p);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, autoOrderCategory, autoOrderPlan]);

  return (
    <div>
      {/* تب‌های دسته‌بندی */}
      <div className="mb-10 flex flex-wrap items-center justify-center gap-2.5">
        {categories.map((c) => (
          <button
            key={c.slug}
            type="button"
            onClick={() => setActive(c.slug)}
            className={`rounded-lg border px-5 py-2.5 text-[13.5px] font-bold transition ${
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
        {cat.plans.map((p, i) => {
          const key = planKey(cat.slug, p.name);
          const status = statuses[key] ?? "idle";

          return (
            <Reveal key={key} delay={i * 80}>
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

                {status === "sent" ? (
                  <div className="flex items-center justify-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-5 py-3 text-[13.5px] font-bold text-emerald-600">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4 flex-shrink-0">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    درخواستت ثبت شد
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={status === "sending" || isPending}
                    onClick={() =>
                      isLoggedIn ? placeOrder(cat, p) : setGuestPromptPlan({ cat, plan: p })
                    }
                    className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-[14px] font-bold transition disabled:pointer-events-none disabled:opacity-60 ${
                      p.highlight
                        ? "text-white shadow-glow hover:-translate-y-0.5"
                        : "border border-ink/15 bg-canvas text-ink hover:border-accent hover:text-accent"
                    }`}
                    style={p.highlight ? { background: cat.color } : undefined}
                  >
                    {status === "sending" ? "در حال ثبت..." : "درخواست مشاوره برای این پلن"}
                  </button>
                )}

                {status === "error" && (
                  <p className="mt-2.5 text-center text-[12.5px] text-red-500">
                    {errorMessages[key] || "یه مشکلی پیش اومد."}
                  </p>
                )}
              </div>
            </Reveal>
          );
        })}
      </div>

      {/* مودال کوچیک: کاربر لاگین نیست و روی «درخواست مشاوره برای این پلن»
          زده — به‌جای اجبار به ثبت‌نام، فقط اسم + شماره می‌گیریم و همون‌جا
          درخواست ثبت می‌شه. کمترین اطکاک ممکن. */}
      {guestPromptPlan && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/55 p-5 backdrop-blur-sm"
          onClick={() => setGuestPromptPlan(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[380px] rounded-card border border-ink/10 bg-canvas p-7 text-right shadow-2xl"
          >
            <div
              className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
              style={{ background: `${guestPromptPlan.cat.color}18` }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke={guestPromptPlan.cat.color}
                strokeWidth={2}
                className="h-6 w-6"
              >
                <path d="M21 11.5a8.4 8.4 0 0 1-8.9 8.4 8.8 8.8 0 0 1-3.9-.9L3 20l1.1-4.5A8.4 8.4 0 0 1 12.6 3a8.4 8.4 0 0 1 8.4 8.5Z" />
              </svg>
            </div>
            <h4 className="mb-1.5 text-center font-display text-lg font-normal">
              اسم و شماره‌ت رو بگو، همین‌جا هماهنگ می‌کنیم
            </h4>
            <p className="mb-5 text-center text-[13px] leading-relaxed text-dim">
              پلن «{guestPromptPlan.plan.name}» از دسته‌ی {guestPromptPlan.cat.label} — بدون تعهد،
              بدون نیاز به ثبت‌نام.
            </p>
            <div className="flex flex-col gap-3">
              <input
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="اسمت"
                className="w-full rounded-[10px] border border-ink/[0.14] bg-surface/60 px-4 py-3 text-[14px] text-ink outline-none transition focus:border-accent"
              />
              <input
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                placeholder="شماره موبایل"
                dir="ltr"
                className="w-full rounded-[10px] border border-ink/[0.14] bg-surface/60 px-4 py-3 text-[14px] text-ink outline-none transition focus:border-accent"
              />
            </div>
            <div className="mt-5 flex flex-col gap-2.5 sm:flex-row-reverse">
              <button
                type="button"
                disabled={!guestName.trim() || !guestPhone.trim()}
                onClick={submitGuestOrder}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-ink px-4 py-3 text-[13.5px] font-bold text-canvas transition hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-50"
              >
                ثبت درخواست
              </button>
              <button
                type="button"
                onClick={() => setGuestPromptPlan(null)}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-ink/15 px-4 py-3 text-[13.5px] font-bold text-dim transition hover:border-ink/25 hover:text-ink"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نوتیف وسط صفحه: سفارش با موفقیت ثبت شد. */}
      {successPlan && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/55 p-5 backdrop-blur-sm"
          onClick={() => setSuccessPlan(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[380px] rounded-card border border-emerald-500/30 bg-canvas p-7 text-center shadow-2xl"
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                className="h-6 w-6 text-emerald-600"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <h4 className="mb-2 font-display text-lg font-normal">درخواستت با موفقیت ثبت شد</h4>
            <p className="mb-6 text-[13.5px] leading-relaxed text-dim">
              درخواست مشاوره برای پلن «{successPlan.plan.name}» ثبت شد. بدون تعهد — تیم وب پیکاسو
              به‌زودی باهات تماس می‌گیره.
            </p>
            <button
              type="button"
              onClick={() => setSuccessPlan(null)}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-ink px-4 py-3 text-[13.5px] font-bold text-canvas transition hover:-translate-y-0.5"
            >
              متوجه شدم
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
