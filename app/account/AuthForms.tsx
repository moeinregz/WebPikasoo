"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { login, signup, type AccountFormState } from "./actions";
import { ArrowLeft, Lock, Phone, User } from "lucide-react";
import { FloatingField, GlassCard } from "@/components/ui/login-form";
import PasswordStrengthMeter from "@/components/PasswordStrengthMeter";
import { isStrongPassword } from "@/lib/passwordPolicy";

const initialState: AccountFormState = null;

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
      className="btn-blood group flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-[15px] font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 disabled:pointer-events-none disabled:opacity-55"
    >
      {pending ? pendingLabel : label}
      <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
    </button>
  );
}

function FormMessage({ state }: { state: AccountFormState }) {
  if (!state) return null;
  return (
    <p role="status" className={`text-center text-[13px] ${state.ok ? "text-emerald-400" : "text-[rgb(240_110_125)]"}`}>
      {state.message}
    </p>
  );
}

const phoneIcon = <Phone className="size-4" />;
const lockIcon = <Lock className="size-4" />;

function LoginForm({ next }: { next?: string }) {
  const [state, formAction] = useFormState(login, initialState);
  return (
    <form action={formAction} className="space-y-8">
      {/* بعد از ورود موفق، کاربر رو به همین مسیر برمی‌گردونیم (مثلاً صفحه‌ی
          سفارشی که قبل از ورود روش بوده) — به‌جای همیشه فرستادنش به /account. */}
      {next && <input type="hidden" name="next" value={next} />}
      <FloatingField id="login_phone" name="phone" label="شماره موبایل" icon={phoneIcon} type="tel" inputMode="numeric" dir="ltr" autoComplete="tel" required />
      <FloatingField id="login_password" name="password" label="رمز عبور" icon={lockIcon} type="password" autoComplete="current-password" required />
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
    <form action={formAction} className="space-y-8">
      {next && <input type="hidden" name="next" value={next} />}
      <FloatingField id="signup_name" name="name" label="اسمت" icon={<User className="size-4" />} autoComplete="name" required />
      <FloatingField id="signup_phone" name="phone" label="شماره موبایل" icon={phoneIcon} type="tel" inputMode="numeric" dir="ltr" autoComplete="tel" required />
      <div>
        <FloatingField id="signup_password" name="password" label="رمز عبور" icon={lockIcon} type="password" autoComplete="new-password" required value={password} onChange={setPassword} />
        <PasswordStrengthMeter password={password} />
      </div>
      <div>
        <FloatingField id="signup_confirm" name="confirmPassword" label="تکرار رمز عبور" icon={lockIcon} type="password" autoComplete="new-password" required value={confirmPassword} onChange={setConfirmPassword} />
        {showMismatch && <p className="mt-1.5 text-[12.5px] text-[rgb(240_110_125)]">رمز عبور و تکرار آن یکسان نیستند.</p>}
      </div>
      <SubmitButton label="ساخت حساب کاربری" pendingLabel="در حال ساخت حساب..." disabled={!canSubmit} />
      <FormMessage state={state} />
    </form>
  );
}

/** Login / signup card from the "login-form" block: a frosted-glass card
 *  over the smoke background (see app/account/page.tsx), floating-label
 *  fields, and a two-way switch between the two forms. Uses the site's
 *  phone + password accounts (no e-mail or Google sign-in exists here). */
export default function AuthForms({ next }: { next?: string }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const isSignup = mode === "signup";

  return (
    // `dark` keeps the theme tokens (strength meter etc.) in their dark
    // values on the always-dark smoke, whatever the site theme is.
    <GlassCard className="dark mx-auto max-w-[400px]">
      <div className="text-center">
        <h1 className="font-display text-3xl font-normal text-white">{isSignup ? "ساخت حساب کاربری" : "خوش برگشتی"}</h1>
        <p className="mt-2 text-[13.5px] text-white/65">
          {isSignup ? "چند ثانیه‌ای — بعدش می‌تونی درخواست پروژه بدی و تیکت بزنی." : "وارد شو تا وضعیت پروژه‌ت رو دنبال کنی."}
        </p>
      </div>

      <div className="relative flex rounded-full border border-white/15 bg-black/20 p-1" role="tablist" aria-label="ورود یا ثبت‌نام">
        <span
          aria-hidden
          className={`btn-blood absolute inset-y-1 w-[calc(50%-4px)] rounded-full transition-[right] duration-300 ${isSignup ? "right-[calc(50%)]" : "right-1"}`}
        />
        {(["login", "signup"] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => setMode(m)}
            className={`relative z-[1] flex-1 rounded-full py-2 text-[13.5px] font-bold transition-colors ${mode === m ? "text-white" : "text-white/60 hover:text-white"}`}
          >
            {m === "login" ? "ورود" : "ثبت‌نام"}
          </button>
        ))}
      </div>

      <div key={mode} className="animate-fade-in-up">
        {isSignup ? <SignupForm next={next} /> : <LoginForm next={next} />}
      </div>

      <p className="text-center text-[12.5px] text-white/55">
        {isSignup ? "قبلاً حساب ساختی؟ " : "حساب نداری؟ "}
        <button type="button" onClick={() => setMode(isSignup ? "login" : "signup")} className="font-bold text-[rgb(235_80_96)] transition hover:text-white">
          {isSignup ? "وارد شو" : "ثبت‌نام کن"}
        </button>
      </p>
    </GlassCard>
  );
}
