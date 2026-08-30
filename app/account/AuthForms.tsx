"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { login, signup, type AccountFormState } from "./actions";
import PasswordInput from "@/components/PasswordInput";
import PasswordStrengthMeter from "@/components/PasswordStrengthMeter";
import { isStrongPassword } from "@/lib/passwordPolicy";

const initialState: AccountFormState = null;

const inputClass =
  "w-full rounded-[10px] border border-ink/[0.16] bg-surface/40 px-4 py-3 text-[14.5px] text-ink placeholder:text-dim/60 outline-none transition focus:border-accent focus:bg-surface/70";

function SubmitButton({
  label,
  pendingLabel,
  disabled,
}: {
  label: string;
  pendingLabel: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="mt-5 w-full rounded-full bg-accent px-6 py-3 text-[15px] font-semibold text-black transition hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}

function FormMessage({ state }: { state: AccountFormState }) {
  if (!state) return null;
  return (
    <p className={`mt-4 text-sm ${state.ok ? "text-accent" : "text-dim"}`}>{state.message}</p>
  );
}

function LoginForm({ next }: { next?: string }) {
  const [state, formAction] = useFormState(login, initialState);
  return (
    <form action={formAction}>
      {/* بعد از ورود موفق، کاربر رو به همین مسیر برمی‌گردونیم (مثلاً صفحه‌ی
          سفارشی که قبل از ورود روش بوده) — به‌جای همیشه فرستادنش به /account. */}
      {next && <input type="hidden" name="next" value={next} />}
      <div className="flex flex-col gap-4">
        <input
          name="phone"
          required
          inputMode="numeric"
          placeholder="شماره موبایل (مثل ۰۹۱۲۳۴۵۶۷۸۹)"
          dir="ltr"
          className={inputClass}
        />
        <PasswordInput
          name="password"
          required
          placeholder="رمز عبور"
          autoComplete="current-password"
          className={inputClass}
        />
      </div>
      <SubmitButton label="ورود" pendingLabel="در حال ورود..." />
      <FormMessage state={state} />
    </form>
  );
}

function SignupForm({ next }: { next?: string }) {
  const [state, formAction] = useFormState(signup, initialState);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const passwordOk = isStrongPassword(password);
  // Only nag about a mismatch once they've actually started typing the
  // confirmation — an empty confirm field isn't a "mismatch" yet.
  const showMismatch = confirmPassword.length > 0 && confirmPassword !== password;
  const canSubmit = passwordOk && confirmPassword.length > 0 && !showMismatch;

  return (
    <form action={formAction}>
      {next && <input type="hidden" name="next" value={next} />}
      <div className="flex flex-col gap-4">
        <input name="name" required placeholder="اسمت" className={inputClass} />
        <input
          name="phone"
          required
          inputMode="numeric"
          placeholder="شماره موبایل (مثل ۰۹۱۲۳۴۵۶۷۸۹)"
          dir="ltr"
          className={inputClass}
        />
        <div>
          <PasswordInput
            name="password"
            required
            placeholder="رمز عبور"
            autoComplete="new-password"
            className={inputClass}
            value={password}
            onChange={setPassword}
          />
          <PasswordStrengthMeter password={password} />
        </div>
        <div>
          <PasswordInput
            name="confirmPassword"
            required
            placeholder="تکرار رمز عبور"
            autoComplete="new-password"
            className={inputClass}
            value={confirmPassword}
            onChange={setConfirmPassword}
          />
          {showMismatch && <p className="mt-1.5 text-[12.5px] text-red-500">رمز عبور و تکرار آن یکسان نیستند.</p>}
        </div>
      </div>
      <SubmitButton label="ساخت حساب کاربری" pendingLabel="در حال ساخت حساب..." disabled={!canSubmit} />
      <FormMessage state={state} />
    </form>
  );
}

/** Login/signup screen. On phones it's the classic tabbed form (not enough
 *  width for a split layout). From `md` up it becomes a two-panel card: one
 *  half is always the active form, the other half is a navy pitch panel
 *  ("Don't have an account?" / "Already have one?") — clicking its button
 *  slides the whole thing over to the other mode. */
export default function AuthForms({ next }: { next?: string }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const isSignup = mode === "signup";

  return (
    <>
      {/* Mobile / narrow screens: simple tab switcher */}
      <div className="mx-auto w-full max-w-sm md:hidden">
        <div className="mb-7 flex rounded-full border border-ink/[0.14] p-1">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 rounded-full py-2.5 text-[13.5px] font-semibold transition ${
              mode === "login" ? "bg-navy text-alabaster" : "text-dim hover:text-ink"
            }`}
          >
            ورود
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`flex-1 rounded-full py-2.5 text-[13.5px] font-semibold transition ${
              mode === "signup" ? "bg-navy text-alabaster" : "text-dim hover:text-ink"
            }`}
          >
            ثبت‌نام
          </button>
        </div>
        {mode === "login" ? <LoginForm next={next} /> : <SignupForm next={next} />}
      </div>

      {/* md and up: split panel with a sliding overlay */}
      <div className="relative mx-auto hidden h-[580px] w-full max-w-[860px] overflow-hidden rounded-card border border-ink/[0.1] shadow-sm md:block">
        {/* Login form — lives on the right half. Solid background is required
            here — without it, whichever panel sits underneath during/after
            the slide would show through and the two forms would blend. */}
        <div
          className={`absolute right-0 top-0 h-full w-1/2 bg-canvas p-10 transition-transform duration-700 ease-in-out ${
            isSignup ? "z-20 -translate-x-full" : "z-30 translate-x-0"
          }`}
        >
          <div className="flex h-full flex-col justify-center">
            <h1 className="mb-2 font-display text-2xl font-normal">ورود به حساب</h1>
            <p className="mb-7 text-sm text-dim">وارد شو تا وضعیت پروژه‌ت رو دنبال کنی.</p>
            <LoginForm next={next} />
          </div>
        </div>

        {/* Signup form — same slot, revealed once it slides to the left half */}
        <div
          className={`absolute right-0 top-0 h-full w-1/2 bg-canvas p-10 transition-all duration-700 ease-in-out ${
            isSignup ? "z-30 -translate-x-full opacity-100" : "z-10 translate-x-0 opacity-0"
          }`}
        >
          <div className="flex h-full flex-col justify-center">
            <h1 className="mb-2 font-display text-2xl font-normal">ساخت حساب کاربری</h1>
            <p className="mb-7 text-sm text-dim">
              چند ثانیه‌ای — بعدش می‌تونی درخواست پروژه بدی و تیکت بزنی.
            </p>
            <SignupForm next={next} />
          </div>
        </div>

        {/* Sliding pitch panel — always covers whichever half the active form isn't on */}
        <div
          className={`absolute right-1/2 top-0 z-40 h-full w-1/2 overflow-hidden bg-navy text-alabaster transition-transform duration-700 ease-in-out ${
            isSignup ? "translate-x-full" : "translate-x-0"
          }`}
        >
          <div className="flex h-full flex-col items-center justify-center gap-5 px-10 text-center">
            {isSignup ? (
              <>
                <p className="font-display text-2xl font-normal">قبلاً حساب ساختی؟</p>
                <p className="text-sm text-alabaster/75">
                  برگرد به فرم ورود و با شماره موبایلت وارد شو.
                </p>
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="rounded-full border-2 border-alabaster px-8 py-3 text-[14.5px] font-bold transition hover:bg-alabaster hover:text-navy"
                >
                  برو به ورود
                </button>
              </>
            ) : (
              <>
                <p className="font-display text-2xl font-normal">حساب نداری؟</p>
                <p className="text-sm text-alabaster/75">
                  یه حساب بساز تا بتونی درخواست پروژه بدی، تیکت بزنی و پیگیرش باشی.
                </p>
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="rounded-full border-2 border-alabaster px-8 py-3 text-[14.5px] font-bold transition hover:bg-alabaster hover:text-navy"
                >
                  برو به ثبت‌نام
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
