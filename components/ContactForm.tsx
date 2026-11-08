"use client";

import { useFormState, useFormStatus } from "react-dom";
import { submitInquiry, type InquiryFormState } from "@/app/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initialState: InquiryFormState = null;


function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-blood inline-flex h-11 w-full items-center justify-center gap-2 rounded-md px-6 text-[15px] font-bold disabled:pointer-events-none disabled:opacity-60"
    >
      {pending ? "در حال ارسال..." : "دریافت مشاوره رایگان"}
      {!pending && (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-[15px] w-[15px]">
          <path d="M19 12H5M11 6l-6 6 6 6" />
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
      <div className="flex flex-col items-center gap-4 w-full rounded-card border border-emerald-500/30 bg-emerald-500/[0.06] px-6 py-14 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-emerald-400 text-emerald-400">
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
    <form action={formAction} className="w-full space-y-4 text-right">
      {/* Honeypot field — invisible to real users, catches simple bots. */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
        aria-hidden="true"
      />

      <div className="flex flex-col gap-2">
        <Label htmlFor="lead_name">اسم</Label>
        <Input id="lead_name" name="name" required defaultValue={defaultName} autoComplete="name" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="lead_phone">شماره موبایل</Label>
        <Input id="lead_phone" name="phone" type="tel" inputMode="numeric" required defaultValue={defaultPhone} dir="ltr" className="text-left" autoComplete="tel" placeholder="09xxxxxxxxx" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="lead_type">نوع پروژه</Label>
        <select
          id="lead_type"
          name="projectType"
          required
          defaultValue={defaultProjectType || ""}
          className="flex h-10 w-full rounded-md border border-ink/15 bg-canvas/60 px-3 py-2 text-sm text-ink transition-colors focus-visible:border-blood-hi/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blood-hi/40"
        >
          <option value="" disabled>
            انتخاب کن
          </option>
          {projectTypeOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="lead_message">توضیح کوتاه</Label>
        <Textarea id="lead_message" name="message" required rows={4} defaultValue={defaultMessage} placeholder="همین کافیه، بقیه‌ش رو تو تماس می‌پرسیم." className="resize-none" />
      </div>

      <SubmitButton />
      {/* Only failure messages ever reach here — a success state
          (state.ok) returns the confirmation panel above instead. */}
      {state && !state.ok && <p className="text-center text-sm text-[rgb(240_110_125)]">{state.message}</p>}
      <p className="text-center text-[12px] text-dim">بدون تعهد — فقط یه گفتگوی کوتاه برای شناخت نیازت.</p>
    </form>
  );
}
