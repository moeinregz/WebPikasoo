"use client";

import { useFormState, useFormStatus } from "react-dom";
import { staffLogin, type DashboardFormState } from "./actions";
import PasswordInput from "@/components/PasswordInput";

const initialState: DashboardFormState = null;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-5 w-full rounded-full bg-accent px-6 py-3 text-[15px] font-bold text-black transition hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60"
    >
      {pending ? "در حال ورود..." : "ورود"}
    </button>
  );
}

/** Same phone+password login as a customer uses on /account — this form
 *  just checks the account against the same `users` table and requires
 *  role admin/developer. No separate admin password exists anymore. */
export default function StaffLoginForm() {
  const [state, formAction] = useFormState(staffLogin, initialState);
  return (
    <form
      action={formAction}
      className="w-full max-w-sm rounded-card border-r-[6px] border-navy bg-surface/40 p-8"
    >
      <h1 className="mb-2 font-display text-2xl font-normal">ورود به داشبورد تیم</h1>
      <p className="mb-6 text-sm text-dim">
        این صفحه فقط برای تیم وب پیکاسوئه — با همون شماره موبایل و رمز عبور حساب ادمین یا
        برنامه‌نویسیت وارد شو.
      </p>
      <div className="flex flex-col gap-4">
        <input
          name="phone"
          required
          inputMode="numeric"
          placeholder="شماره موبایل (مثل ۰۹۱۲۳۴۵۶۷۸۹)"
          dir="ltr"
          autoFocus
          className="w-full rounded-[10px] border border-ink/[0.16] bg-surface/40 px-4 py-3 text-[14.5px] text-ink outline-none transition focus:border-accent"
        />
        <PasswordInput
          name="password"
          required
          placeholder="رمز عبور"
          autoComplete="current-password"
          className="w-full rounded-[10px] border border-ink/[0.16] bg-surface/40 px-4 py-3 text-[14.5px] text-ink outline-none transition focus:border-accent"
        />
      </div>
      {state && !state.ok && <p className="mt-3 text-sm text-dim">{state.message}</p>}
      <SubmitButton />
    </form>
  );
}
