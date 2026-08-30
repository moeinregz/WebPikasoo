"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createUserAction, type CreateUserFormState } from "./actions";
import PasswordInput from "@/components/PasswordInput";

const initialState: CreateUserFormState = null;

const inputClass =
  "w-full rounded-[10px] border border-ink/[0.16] bg-surface/40 px-4 py-3 text-[14.5px] text-ink placeholder:text-dim/60 outline-none transition focus:border-accent focus:bg-surface/70";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-1 rounded-full bg-accent px-6 py-3 text-[14.5px] font-semibold text-black transition hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60"
    >
      {pending ? "در حال افزودن..." : "افزودن کاربر"}
    </button>
  );
}

/** Lets an admin create any account type directly — customer, developer,
 *  or admin — instead of needing shell access to run the setUserRole
 *  script. Only rendered for admins (checked again server-side too). Used
 *  from both the "کاربران ثبت‌نامی" and "تیم برنامه‌نویسی" tabs, each
 *  passing a sensible default role/heading for where it's opened from. */
export default function AddUserForm({
  defaultRole = "customer",
  heading = "افزودن کاربر جدید",
  buttonLabel = "افزودن کاربر جدید",
}: {
  defaultRole?: "customer" | "developer" | "admin";
  heading?: string;
  buttonLabel?: string;
}) {
  const [state, formAction] = useFormState(createUserAction, initialState);
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mb-6 inline-flex items-center gap-2 rounded-full border-2 border-ink/70 px-5 py-2.5 text-[13.5px] font-bold text-ink transition hover:bg-ink hover:text-canvas"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
          <path d="M12 5v14M5 12h14" />
        </svg>
        {buttonLabel}
      </button>
    );
  }

  return (
    <form
      action={formAction}
      className="mb-6 rounded-card border border-ink/[0.14] bg-surface/20 p-6"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-normal">{heading}</h2>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-sm text-dim transition hover:text-ink"
        >
          بستن
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <input name="name" required placeholder="نام و نام خانوادگی" className={inputClass} />
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
          placeholder="رمز عبور (حداقل ۶ کاراکتر)"
          autoComplete="new-password"
          className={inputClass}
        />
        <select name="role" defaultValue={defaultRole} className={inputClass}>
          <option value="customer">مشتری</option>
          <option value="developer">عضو تیم (برنامه‌نویس/سئو/فروش و...)</option>
          <option value="admin">ادمین</option>
        </select>
        <input
          name="title"
          placeholder="عنوان/سمت (مثلاً برنامه‌نویس، کارشناس سئو، کارشناس فروش) — اختیاری"
          className={`${inputClass} sm:col-span-2`}
        />
      </div>

      {state && (
        <p className={`mt-3 text-sm ${state.ok ? "text-accent" : "text-dim"}`}>
          {state.message}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
