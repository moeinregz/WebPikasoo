import type { ReactNode } from "react";
import Reveal from "./Reveal";

type Step = {
  n: string;
  title: string;
  tag: string;
  desc: string;
  icon: ReactNode;
  color: string;
};

/** ترتیب مراحل از نظر روان‌شناسی فروش/اعتماد چیده شده، نه فقط از نظر
 *  فنی: از کم‌ریسک‌ترین قدم شروع می‌شه (مشاوره‌ی رایگان و بدون تعهد،
 *  که مانع اصلی شروع رو برمی‌داره)، بعد با شفافیت مکتوب اعتماد می‌سازه،
 *  کنترل تصمیم رو دست مشتری می‌ده (تایید طراحی)، در طول مسیر با
 *  گزارش‌های مرحله‌ای اضطراب انتظار رو کم می‌کنه، قبل از تحویل با تست
 *  کامل اطمینان می‌ده، و در نهایت با پشتیبانی مستمر ترس از «تنها موندن
 *  بعد تحویل» رو از بین می‌بره — دقیقاً همون چیزی که باعث می‌شه مشتری
 *  با خیال راحت قدم اول رو برداره. */
const steps: Step[] = [
  {
    n: "۰۱",
    title: "مشاوره‌ی رایگان",
    tag: "بدون تعهد، بدون هزینه",
    desc: "یه جلسه‌ی کوتاه که فقط نیاز واقعی کسب‌وکارتون رو می‌شنویم — نه فروش، فقط گوش دادن.",
    color: "#0077B6",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <path d="M21 11.5a8.4 8.4 0 0 1-8.9 8.4 8.8 8.8 0 0 1-3.9-.9L3 20l1.1-4.5A8.4 8.4 0 0 1 12.6 3a8.4 8.4 0 0 1 8.4 8.5Z" />
      </svg>
    ),
  },
  {
    n: "۰۲",
    title: "تحلیل و پیشنهاد",
    tag: "قیمت و زمان‌بندی مکتوب",
    desc: "بررسی فنی نیازتون و ارائه‌ی یه پیشنهاد شفاف — دقیقاً چی می‌سازیم، کِی و با چه هزینه‌ای.",
    color: "#00B4D8",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <rect x="5" y="3.5" width="14" height="17" rx="2" />
        <path d="M8.5 8h7M8.5 11.5h7M8.5 15h4" />
      </svg>
    ),
  },
  {
    n: "۰۳",
    title: "طراحی و تایید شما",
    tag: "کنترل کامل با شماست",
    desc: "پیش‌نمایش طراحی رو می‌بینید و نظر می‌دید؛ کار جلو نمی‌ره مگر با تایید خودتون.",
    color: "#0077B6",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <path d="M4 20l3.3-1L18 8.3a1.9 1.9 0 0 0-2.7-2.7L4.6 16.3 4 20Z" />
        <path d="M13 7l2.7 2.7" />
      </svg>
    ),
  },
  {
    n: "۰۴",
    title: "توسعه با گزارش هفتگی",
    tag: "شفافیت در طول مسیر",
    desc: "هر هفته دقیقاً می‌بینید چقدر پیش رفتیم — بدون سکوت طولانی و بی‌خبری.",
    color: "#023E8A",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <path d="M4 19V5M4 19h16" />
        <path d="M8 15l3.5-4 3 3L19 8" />
      </svg>
    ),
  },
  {
    n: "۰۵",
    title: "تست کامل و تحویل",
    tag: "تضمین کیفیت",
    desc: "قبل از تحویل، همه‌چیز رو کامل تست می‌کنیم؛ چیزی که تحویل می‌گیرید بدون دردسر اجرا می‌شه.",
    color: "#0077B6",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <path d="M9 12.5l2.2 2.2L16 9.5" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    ),
  },
  {
    n: "۰۶",
    title: "پشتیبانی مستمر",
    tag: "همیشه در دسترس",
    desc: "تحویل پروژه پایان همکاری نیست؛ همیشه یه تیم پشت خط برای رفع مشکل و توسعه‌ی بعدی هست.",
    color: "#48CAE4",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
        <path d="M4 12a8 8 0 0 1 16 0" />
        <rect x="2.5" y="12" width="4" height="6" rx="1.5" />
        <rect x="17.5" y="12" width="4" height="6" rx="1.5" />
        <path d="M20 18v1a3 3 0 0 1-3 3h-3" />
      </svg>
    ),
  },
];

export default function Process() {
  const row1 = steps.slice(0, 3);
  const row2 = steps.slice(3, 6);

  return (
    <section className="relative scroll-mt-[90px] overflow-hidden border-t border-ink/10 py-[110px]">
      <span
        className="pointer-events-none absolute -left-[200px] top-[120px] z-0 h-[520px] w-[520px] rounded-full opacity-30 blur-[130px]"
        style={{ background: "rgba(0, 119, 182, .35)" }}
      />
      <span
        className="pointer-events-none absolute -right-[220px] bottom-[40px] z-0 h-[480px] w-[480px] rounded-full opacity-25 blur-[130px]"
        style={{ background: "rgba(72, 202, 228, .35)" }}
      />

      <div className="relative z-[1] mx-auto max-w-container px-6">
        <Reveal className="mb-16 flex items-baseline gap-4">
          <span className="flex h-8 items-center rounded-full border border-ink/10 bg-surface px-3.5 font-mono text-sm font-bold text-ink">
            نقشه‌ی
          </span>
          <div>
            <h2 className="font-display text-[28px] font-normal sm:text-[34px] lg:text-[40px]">فرایند همکاری</h2>
            <p className="mt-2.5 max-w-[62ch] text-[15px] text-dim">
              از اولین جلسه‌ی رایگان تا پشتیبانی بعد از تحویل — شش قدم روشن که همیشه می‌دونید دقیقاً
              کجای مسیر ایستادید.
            </p>
          </div>
        </Reveal>

        {/* نسخه‌ی دسکتاپ — دو ردیف سه‌تایی با چیدمان گرید معمولی؛ کارت‌ها
            هیچ‌وقت روی هم نمی‌افتن چون هر کدوم تو یه خونه‌ی مجزای گرید
            جا می‌گیرن، نه پوزیشن مطلق روی مسیر. */}
        <div className="hidden lg:block">
          {[row1, row2].map((row, rowIdx) => (
            <div key={rowIdx} className={rowIdx === 0 ? "relative mb-16" : "relative"}>
              <span className="pointer-events-none absolute inset-x-[16.6667%] top-7 h-[2px] bg-gradient-to-r from-accent3 via-accent to-accent2/50" />
              <div className="relative grid grid-cols-3 gap-6">
                {row.map((s, i) => {
                  const idx = rowIdx * 3 + i;
                  return (
                    <Reveal key={s.n} delay={idx * 120} className="flex flex-col items-center">
                      <span
                        className="relative z-10 mb-5 flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border-2 bg-canvas p-3.5 shadow-glow-soft"
                        style={{ borderColor: s.color, color: s.color }}
                      >
                        {s.icon}
                        <span
                          className="absolute -top-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full font-mono text-[10px] font-black text-white"
                          style={{ background: s.color }}
                        >
                          {idx + 1}
                        </span>
                      </span>

                      <div className="w-full rounded-card border border-ink/10 bg-surface/70 p-4 backdrop-blur-sm">
                        <span
                          className="mb-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] font-bold"
                          style={{ background: `${s.color}1f`, color: s.color }}
                        >
                          {s.tag}
                        </span>
                        <h3 className="text-[14.5px] font-bold">{s.title}</h3>
                        <p className="mt-1 text-[12.5px] leading-relaxed text-dim">{s.desc}</p>
                      </div>
                    </Reveal>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* نسخه‌ی موبایل/تبلت — تایم‌لاین عمودی ساده، همون ترتیب و همون تگ‌ها */}
        <div className="relative lg:hidden">
          <span className="absolute right-[27px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-accent3 via-accent to-accent2/40" />
          <div className="flex flex-col gap-8">
            {steps.map((s, i) => (
              <Reveal key={s.n} delay={i * 90} className="relative flex items-start gap-5 pr-0">
                <span
                  className="relative z-[1] flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border-2 bg-canvas p-3.5"
                  style={{ borderColor: s.color, color: s.color }}
                >
                  {s.icon}
                  <span
                    className="absolute -top-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full font-mono text-[10px] font-black text-white"
                    style={{ background: s.color }}
                  >
                    {i + 1}
                  </span>
                </span>
                <div className="min-w-0 flex-1 rounded-card border border-ink/10 bg-surface/50 p-4">
                  <span
                    className="mb-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] font-bold"
                    style={{ background: `${s.color}1f`, color: s.color }}
                  >
                    {s.tag}
                  </span>
                  <h3 className="text-[14.5px] font-bold">{s.title}</h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-dim">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
