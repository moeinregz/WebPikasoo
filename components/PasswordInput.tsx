"use client";

import { useState, type ChangeEvent } from "react";

/** A password `<input>` with a show/hide toggle button — same styling
 *  contract as a plain input (pass the same className you'd give one) plus
 *  a bit of extra left padding reserved for the toggle button so the eye
 *  icon never overlaps typed text.
 *
 *  Works uncontrolled (just pass `defaultValue`, as the login form does)
 *  or controlled (pass `value` + `onChange`, as the signup form does so it
 *  can drive the live password-strength meter). */
export default function PasswordInput({
  name,
  placeholder,
  required,
  defaultValue,
  value,
  onChange,
  className,
  autoComplete,
  id,
}: {
  name: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  className: string;
  autoComplete?: string;
  id?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        type={visible ? "text" : "password"}
        name={name}
        placeholder={placeholder}
        required={required}
        {...(onChange
          ? { value: value ?? "", onChange: (e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value) }
          : { defaultValue })}
        autoComplete={autoComplete}
        className={`${className} pl-11`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        tabIndex={-1}
        aria-label={visible ? "مخفی کردن رمز عبور" : "نمایش رمز عبور"}
        aria-pressed={visible}
        className="absolute left-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-dim transition hover:text-ink"
      >
        {visible ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-[18px] w-[18px]">
            <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
            <path d="M4 4l16 16" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-[18px] w-[18px]">
            <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  );
}
