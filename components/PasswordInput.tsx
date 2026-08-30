"use client";

import { useState } from "react";

/** A password `<input>` with a show/hide toggle button — same styling
 *  contract as a plain input (pass the same className you'd give one) plus
 *  a bit of extra left padding reserved for the toggle button so the eye
 *  icon never overlaps typed text. */
export default function PasswordInput({
  name,
  placeholder,
  required,
  defaultValue,
  className,
  autoComplete,
}: {
  name: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
  className: string;
  autoComplete?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        name={name}
        placeholder={placeholder}
        required={required}
        defaultValue={defaultValue}
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
