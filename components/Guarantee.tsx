import Reveal from "./Reveal";

/** ضمانت / کاهش ریسک خرید — دقیقاً همون گارانتی که تو Trust هم اشاره
 *  شده (۳۰ روز رفع باگ رایگان) اینجا با جزئیات بیشتر و به‌عنوان یه بخش
 *  مستقل قبل از FAQ تکرار می‌شه، چون درست همین‌جای Funnel (بعد از دیدن
 *  قیمت) جاییه که نگرانی «اگه خوب از آب درنیومد چی؟» بیشترین وزن رو داره. */
export default function Guarantee() {
  return (
    <section
      id="guarantee"
      className="relative scroll-mt-[90px] overflow-hidden border-t border-ink/10 py-[100px]"
    >
      <span
        className="pointer-events-none absolute -left-[200px] top-[40px] z-0 h-[480px] w-[480px] rounded-full opacity-30 blur-[130px]"
        style={{ background: "rgba(0, 180, 216, .35)" }}
      />

      <div className="relative z-[1] mx-auto max-w-container px-6">
        <Reveal className="mx-auto flex max-w-[820px] flex-col items-center gap-6 rounded-card border border-ink/10 bg-surface/50 p-8 text-center sm:p-12">
          <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-accent text-accent">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-8 w-8">
              <path d="M12 3 4.5 6.5v5c0 4.6 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.9 7.5-9.5v-5L12 3Z" />
              <path d="m8.5 12.3 2.4 2.4 4.6-4.9" />
            </svg>
          </span>
          <span className="rounded-full border border-ink/10 bg-canvas px-3.5 py-1.5 font-mono text-[12px] font-bold text-dim">
            Guarantee
          </span>
          <h2 className="font-display text-[26px] font-normal sm:text-[32px]">
            اگه پروژه باگ فنی داشت، رایگان رفعش می‌کنیم
          </h2>
          <p className="max-w-[56ch] text-[14.5px] leading-relaxed text-dim">
            بعد از تحویل هر پروژه، ۳۰ روز گارانتی رفع باگ فنی داری — بدون هزینه‌ی اضافه و بدون
            بحث. اگه چیزی طبق چیزی که توافق کردیم کار نکنه، مسئولیتش با ماست، نه تو.
          </p>
          <a
            href="#lead-form"
            className="mt-2 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 text-[14.5px] font-bold text-canvas transition hover:-translate-y-0.5"
          >
            با خیال راحت شروع کن — مشاوره رایگان
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-[15px] w-[15px]">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>
        </Reveal>
      </div>
    </section>
  );
}
