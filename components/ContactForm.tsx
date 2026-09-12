"use client";

import { useFormState, useFormStatus } from "react-dom";
import { submitInquiry, type InquiryFormState } from "@/app/actions";

const initialState: InquiryFormState = null;

const inputClass =
  "w-full rounded-[10px] border border-ink/[0.14] bg-surface/60 px-4 py-3 text-[14.5px] text-ink placeholder:text-dim/60 outline-none transition focus:border-accent focus:shadow-glow";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-[15px] font-semibold text-white shadow-glow transition hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60 sm:w-auto"
    >
      {pending ? "در حال ارسال..." : "دریافت مشاوره رایگان"}
      {!pending && (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-[15px] w-[15px]">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      )}
    </button>
  );
}

const projectTypeOptions = [
  "پنل مدیریت / توسعه نرم‌افزار",
  "سایت کدنویسی اختصاصی",
  "وب‌سایت وردپرسی",
  "سئو",
  "نمی‌دانم چه راهکاری نیاز دارم",
  "سایر",
];

// فرم عمداً کوتاهه: فقط اسم + شماره تماس + نوع پروژه + یه توضیح کوتاه —
// هر فیلد اضافه یعنی افت نرخ تکمیل فرم. ایمیل و بودجه‌ی تقریبی حذف شدن؛
// این‌ها رو تو همون تماس اول تلفنی می‌پرسیم، نه قبل از اینکه کاربر اصلاً
// اعتماد کنه اطلاعاتش رو بده.
export default function ContactForm({
  defaultName,
  defaultPhone,
  defaultProjectType,
  defaultMessage,
}: {
  defaultName?: string;
  defaultPhone?: string;
  defaultProjectType?: string;
  defaultMessage?: string;
} = {}) {
  const [state, formAction] = useFormState(submitInquiry, initialState);

  // Once the request is saved successfully, swap the whole form out for a
  // confirmation message instead of leaving the (now-empty) form sitting
  // there — it also stops someone re-submitting the same request out of
  // habit or uncertainty about whether it went through.
  if (state?.ok) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-card border border-accent/30 bg-accent/[0.06] px-6 py-14 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-accent text-accent">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-6 w-6">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
        <p className="text-lg font-semibold text-ink">ممنون، درخواستت ثبت شد!</p>
        <p className="max-w-sm text-[14.5px] leading-relaxed text-dim">
          به‌زودی باهات تماس می‌گیریم — بدون هیچ تعهدی. لازم نیست دوباره فرم رو پر کنی.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="text-right">
      {/* Honeypot field — invisible to real users, catches simple bots. */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
        aria-hidden="true"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <input name="name" required defaultValue={defaultName} placeholder="اسمت" className={inputClass} />
        <input
          name="phone"
          required
          defaultValue={defaultPhone}
          placeholder="شماره موبایل"
          className={inputClass}
          dir="ltr"
        />
      </div>

      <select
        name="projectType"
        required
        defaultValue={defaultProjectType || ""}
        className={`${inputClass} mt-4`}
      >
        <option value="" disabled>
          نوع پروژه
        </option>
        {projectTypeOptions.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>

      <textarea
        name="message"
        required
        rows={4}
        defaultValue={defaultMessage}
        placeholder="یه توضیح کوتاه از پروژه‌ت — همین کافیه، بقیه‌ش رو تو تماس می‌پرسیم."
        className={`${inputClass} mt-4 resize-none`}
      />

      <p className="mt-3 text-[12.5px] text-dim">
        بدون تعهد — فقط یه گفتگوی کوتاه برای شناخت نیازت.
      </p>

      <div className="mt-5 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <SubmitButton />
        {/* Only failure messages ever reach here — a success state
            (state.ok) returns the confirmation panel above instead. */}
        {state && !state.ok && (
          <p className="flex items-center gap-2 text-sm text-dim">
            <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-dim text-dim">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-3 w-3">
                <path d="M12 9v4M12 17h.01" />
              </svg>
            </span>
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
