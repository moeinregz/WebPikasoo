import type { ReactNode } from "react";
import Reveal from "./Reveal";
import SkillCard from "./SkillCard";

type Skill = { name: string; desc: string };

const frontendSkills: Skill[] = [
  { name: "React", desc: "ساخت رابط‌های کاربری پویا، سریع و کاملاً کامپوننت‌محور" },
  { name: "Next.js", desc: "اپلیکیشن‌های فول‌استک با رندر سمت سرور برای سرعت و سئوی بهتر" },
];

const backendSkills: Skill[] = [
  { name: "Node.js", desc: "سرویس‌ها و API های سمت سرور امن، سریع و مقیاس‌پذیر" },
  { name: "MongoDB", desc: "طراحی و مدیریت پایگاه داده‌های NoSQL مقیاس‌پذیر" },
  { name: "C#", desc: "توسعه‌ی نرم‌افزارهای سازمانی و بک‌اند قدرتمند با اکوسیستم دات‌نت" },
  { name: "PostgreSQL", desc: "پایگاه داده‌ی رابطه‌ای قدرتمند برای داده‌های حجیم و پیچیده" },
  { name: "FastAPI", desc: "ساخت API های سریع، امن و خودمستندشونده با پایتون" },
  { name: "PHP", desc: "توسعه‌ی وب سمت سرور و سیستم‌های سفارشی سریع" },
  { name: "Go", desc: "سرویس‌های بک‌اند بسیار سریع، سبک و با همزمانی بالا" },
  { name: "SQLite", desc: "پایگاه داده‌ی سبک و بدون نیاز به سرور برای پروژه‌های کوچک تا متوسط" },
];

const wpSkills: Skill[] = [
  { name: "WordPress", desc: "ساخت، شخصی‌سازی و مدیریت کامل سایت‌های وردپرسی" },
  { name: "Elementor", desc: "طراحی صفحات حرفه‌ای بدون کدنویسی با درگ‌اند‌دراپ" },
  { name: "WooCommerce", desc: "راه‌اندازی فروشگاه آنلاین از صفر تا اتصال درگاه پرداخت" },
  { name: "WoodMart", desc: "سفارشی‌سازی کامل قالب فروشگاهی WoodMart" },
];

const aiSkills: Skill[] = [
  { name: "Python", desc: "زبان اصلی برای مدل‌سازی، اسکریپت‌نویسی و اتوماسیون داده‌محور" },
  { name: "PyTorch", desc: "آموزش و توسعه‌ی مدل‌های یادگیری عمیق" },
  { name: "TensorFlow", desc: "ساخت و اجرای مدل‌های یادگیری ماشین در مقیاس تولید" },
  { name: "Scikit-learn", desc: "الگوریتم‌های کلاسیک یادگیری ماشین و پیش‌پردازش داده" },
  { name: "Ultralytics", desc: "تشخیص و ردیابی اشیا در تصویر و ویدیو (YOLO)" },
  { name: "NumPy", desc: "محاسبات عددی و پردازش آرایه‌ای با سرعت بالا" },
];

// هر مهارت وقتی هاور می‌شه، اول تایتلش با انیمیشن لود می‌شه و بعد توضیحش
// کلمه‌به‌کلمه مثل بارون می‌ریزه. رنگ بردر/بک‌گراند/گلوی هر کارت هم رنگ
// برند خودِ همون تکنولوژیه و فقط سمتی از کارت که موس نزدیکشه روشن می‌شه —
// منطقش داخل SkillCard با ردیابی موقعیت ماوس (--sx/--sy) پیاده شده.
function SkillGrid({ items }: { items: Skill[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((s) => (
        <SkillCard key={s.name} skill={s} />
      ))}
    </div>
  );
}

function SubHead({ label }: { label: string }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="h-2 w-2 flex-shrink-0 rounded-full bg-accent" />
      <span className="font-mono text-[12.5px] font-bold uppercase tracking-[0.08em] text-dim">
        {label}
      </span>
      <span className="h-px flex-1 bg-ink/10" />
    </div>
  );
}

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
      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-accent font-mono text-[13px] font-black text-white">
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
      <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-ink/10 bg-surface p-2 text-ink">
        {icon}
      </span>
    </div>
  );
}

/** Standalone "/skills" page — the full, detailed breakdown of every
 *  technology the team works with. Pulled out of the homepage (which now
 *  shows just the 4 headline services) so people who want the nitty-gritty
 *  still have somewhere to see it, one click away. */
export default function Skills() {
  return (
    <section className="relative scroll-mt-[90px] overflow-hidden py-[90px] sm:py-[110px]">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[520px] bg-dot-grid" />
      <span
        className="pointer-events-none absolute -right-[220px] -top-[260px] z-0 h-[640px] w-[640px] rounded-full opacity-45 blur-[130px]"
        style={{ background: "rgba(0, 119, 182, .35)" }}
      />
      <span
        className="pointer-events-none absolute -left-[180px] -bottom-[240px] z-0 h-[520px] w-[520px] rounded-full opacity-35 blur-[130px]"
        style={{ background: "rgba(2, 62, 138, .35)" }}
      />

      <div className="relative z-[1] mx-auto max-w-container px-6">
        <Reveal className="mb-14 flex items-baseline gap-4">
          <span className="flex h-8 items-center rounded-full border border-ink/10 bg-surface px-3.5 font-mono text-sm font-bold text-ink">
            تیم
          </span>
          <div>
            <h1 className="font-display text-[28px] font-normal sm:text-[34px] lg:text-[40px]">
              مهارت‌های فنی
            </h1>
            <p className="mt-2.5 max-w-[60ch] text-[15px] text-dim">
              از فرانت‌اند و بک‌اند تا هوش مصنوعی و وردپرس؛ همه‌ی تکنولوژی‌هایی که تیم وب پیکاسو
              روزمره باهاشون کار می‌کنه.
            </p>
          </div>
        </Reveal>

        <div className="relative">
          {/* 01 — Frontend & Backend */}
          <Reveal className="relative z-[1] mb-16">
            <GroupHead
              num="01"
              title="فرانت‌اند و بک‌اند"
              icon={
                <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-full w-full">
                  <rect x="6" y="6" width="36" height="10" rx="3" />
                  <rect x="6" y="19" width="36" height="10" rx="3" opacity=".7" />
                  <rect x="6" y="32" width="36" height="10" rx="3" opacity=".4" />
                </svg>
              }
            />

            {/* فرانت و بک جدا از هم نمایش داده می‌شن تا چیدمان برای کاربر
                خواناتر و قابل‌مرور‌تر باشه */}
            <SubHead label="فرانت‌اند" />
            <SkillGrid items={frontendSkills} />

            <div className="mt-8">
              <SubHead label="بک‌اند" />
              <SkillGrid items={backendSkills} />
            </div>
          </Reveal>

          {/* 02 — WordPress & E-commerce */}
          <Reveal className="relative z-[1] mb-16">
            <GroupHead
              num="02"
              title="وردپرس و ای‌کامرس"
              icon={
                <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-full w-full">
                  <path d="M10 16h28l-2 22a3 3 0 0 1-3 3H15a3 3 0 0 1-3-3L10 16Z" />
                  <path d="M17 16v-3a7 7 0 0 1 14 0v3" />
                </svg>
              }
            />
            <SkillGrid items={wpSkills} />
          </Reveal>

          {/* 03 — AI & Machine Learning */}
          <Reveal className="relative z-[1] mb-0">
            <GroupHead
              num="03"
              title="هوش مصنوعی و یادگیری ماشین"
              icon={
                <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-full w-full">
                  <circle cx="10" cy="12" r="3.5" />
                  <circle cx="10" cy="24" r="3.5" />
                  <circle cx="10" cy="36" r="3.5" />
                  <circle cx="24" cy="18" r="3.5" />
                  <circle cx="24" cy="30" r="3.5" />
                  <circle cx="38" cy="24" r="3.5" />
                  <path d="M13 12 L21 18M13 24 L21 18M13 24 L21 30M13 36 L21 30M27 18 L35 24M27 30 L35 24" opacity=".6" />
                </svg>
              }
            />
            <SkillGrid items={aiSkills} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
