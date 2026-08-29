import Reveal from "./Reveal";

type Testimonial = {
  name: string;
  role: string;
  quote: string;
  initials: string;
  color: string;
};

/** سه نظر واقعی‌طور از سه صاحب‌کسب‌وکار مختلف — هرکدوم عمداً روی یه
 *  نگرانی رایج انگشت می‌ذاره (ترس از کلاه‌برداری/گم‌شدن پول، ترس از تنها
 *  موندن بعد از تحویل، ترس از جدی گرفته نشدن یه کسب‌وکار کوچیک) و نشون
 *  می‌ده اون نگرانی چطور برطرف شده — نه فقط تعریف کلی. */
const testimonials: Testimonial[] = [
  {
    name: "محمدرضا اکبری",
    role: "صاحب کافه زمزمه",
    quote:
      "راستش قبلش یه بار با یه فریلنسر دیگه سوخته بودیم، نصفه‌کاره ول کرد رفت. اینجا از همون اول قیمت و زمان تحویل رو دقیق نوشتن، و همون‌جوری هم پیش رفت؛ هیچ هزینه‌ی غافلگیرکننده‌ای وسط کار نیومد.",
    initials: "مر",
    color: "#0077B6",
  },
  {
    name: "سارا نجفی",
    role: "مدیر فروشگاه آنلاین پوشاک",
    quote:
      "بعد از تحویل سایت، دو هفته بعدش یه باگ کوچیک تو صفحه‌ی پرداخت پیدا کردیم. نگران بودم بگن «کارمون تموم شده»، ولی همون روز جواب دادن و رفعش کردن. این خیالم رو راحت کرد که تنها نمی‌مونیم.",
    initials: "سن",
    color: "#00B4D8",
  },
  {
    name: "دکتر امیر حسینی",
    role: "مدیر کلینیک دندان‌پزشکی",
    quote:
      "فکر می‌کردم کلینیک کوچیک ما در حد این تیم نیست، ولی درست مثل یه پروژه‌ی بزرگ باهامون جلسه گذاشتن و همه‌چی رو ساده توضیح دادن. الان بیمارها از رو همون سایت وقت می‌گیرن و اعتماد بیشتری به مطب دارن.",
    initials: "اح",
    color: "#023E8A",
  },
];

function StarRow() {
  return (
    <div className="flex items-center gap-1 text-accent3" aria-label="۵ از ۵ ستاره">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path d="M10 1.5l2.6 5.4 5.9.7-4.3 4.1 1.1 5.9L10 14.8l-5.3 2.8 1.1-5.9L1.5 7.6l5.9-.7L10 1.5Z" />
        </svg>
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <section
      id="testimonials"
      className="relative scroll-mt-[90px] overflow-hidden border-t border-ink/10 py-[100px]"
    >
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[420px] bg-dot-grid" />

      <div className="relative z-[1] mx-auto max-w-container px-6">
        <Reveal className="mb-12 flex items-baseline gap-4">
          <span className="flex h-8 items-center rounded-full border border-ink/10 bg-surface px-3.5 font-mono text-sm font-bold text-ink">
            ۰۳ / ۰۴
          </span>
          <div>
            <h2 className="font-display text-[28px] font-normal sm:text-[34px] lg:text-[40px]">
              حرف مشتری‌هامون رو باور کن، نه حرف ما رو
            </h2>
            <p className="mt-2.5 max-w-[62ch] text-[15px] text-dim">
              این‌ها آدم‌هایی‌ان که قبل از شروع همون نگرانی‌هایی رو داشتن که شاید الان تو داری —
              و بعد از تحویل پروژه، این چیزی بود که گفتن.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal
              key={t.name}
              delay={i * 80}
              className={[
                "flex flex-col rounded-card border border-ink/10 bg-surface/50 p-5 sm:p-6",
                i === 2 ? "col-span-2 sm:col-span-1" : "",
              ].join(" ")}
            >
              <div className="mb-3 flex items-center justify-between">
                <svg viewBox="0 0 32 24" fill="none" className="h-5 w-7 flex-shrink-0 text-accent/25">
                  <path
                    d="M13.6 0C6.4 3 2 8.9 2 15.8 2 20.6 5 24 9.3 24c3.5 0 6-2.7 6-6.1 0-3.2-2.3-5.6-5.4-5.6-.6 0-1.1.1-1.5.2.6-3.8 3.3-7 6.8-8.7L13.6 0Zm16.4 0c-7.2 3-11.6 8.9-11.6 15.8 0 4.8 3 8.2 7.3 8.2 3.5 0 6-2.7 6-6.1 0-3.2-2.3-5.6-5.4-5.6-.6 0-1.1.1-1.5.2.6-3.8 3.3-7 6.8-8.7L30 0Z"
                    fill="currentColor"
                  />
                </svg>
                <StarRow />
              </div>

              <p className="mb-5 flex-1 text-[13.5px] leading-relaxed text-ink/85 sm:text-[14.5px]">
                {t.quote}
              </p>

              <div className="mt-auto flex items-center gap-3 border-t border-ink/10 pt-4">
                <span
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white"
                  style={{ background: t.color }}
                >
                  {t.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13.5px] font-bold text-ink">{t.name}</div>
                  <div className="truncate text-[12px] text-dim">{t.role}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
