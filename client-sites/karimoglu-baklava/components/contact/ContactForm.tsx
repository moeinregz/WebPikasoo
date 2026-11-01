"use client";

import { useState, type FormEvent } from "react";

export function ContactForm() {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "busy" | "sent" | "error">("idle");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus("busy");
    setFieldErrors({});
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-requested-with": "karimoglu-web" },
        body: JSON.stringify({ name, mobile, message }),
      });
      const data = await res.json();
      if (!res.ok) {
        const errs: Record<string, string> = {};
        for (const e of data.details?.errors ?? []) errs[e.field] = e.message;
        setFieldErrors(errs);
        setStatus("error");
        return;
      }
      setStatus("sent");
      setName("");
      setMobile("");
      setMessage("");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div role="status" className="rounded-lg border border-border bg-bg-secondary p-6 text-body text-text-primary">
        پیام شما با موفقیت ارسال شد. تیم ما در اسرع وقت با شما تماس می‌گیرد.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-bodySm text-text-secondary">
        نام
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={!!fieldErrors.name}
          aria-describedby={fieldErrors.name ? "contact-name-error" : undefined}
          className="rounded-md border border-border px-3 py-2.5 text-body text-text-primary"
        />
        {fieldErrors.name && (
          <span id="contact-name-error" role="alert" className="text-caption text-brand-red">
            {fieldErrors.name}
          </span>
        )}
      </label>

      <label className="flex flex-col gap-1.5 text-bodySm text-text-secondary">
        شماره موبایل
        <input
          type="tel"
          required
          dir="ltr"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          placeholder="09xxxxxxxxx"
          aria-invalid={!!fieldErrors.mobile}
          aria-describedby={fieldErrors.mobile ? "contact-mobile-error" : undefined}
          className="rounded-md border border-border px-3 py-2.5 text-body text-text-primary"
        />
        {fieldErrors.mobile && (
          <span id="contact-mobile-error" role="alert" className="text-caption text-brand-red">
            {fieldErrors.mobile}
          </span>
        )}
      </label>

      <label className="flex flex-col gap-1.5 text-bodySm text-text-secondary">
        پیام
        <textarea
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          aria-invalid={!!fieldErrors.message}
          aria-describedby={fieldErrors.message ? "contact-message-error" : undefined}
          className="rounded-md border border-border px-3 py-2.5 text-body text-text-primary"
        />
        {fieldErrors.message && (
          <span id="contact-message-error" role="alert" className="text-caption text-brand-red">
            {fieldErrors.message}
          </span>
        )}
      </label>

      {status === "error" && Object.keys(fieldErrors).length === 0 && (
        <p role="alert" className="text-bodySm text-brand-red">
          ارسال پیام با خطا مواجه شد. لطفاً دوباره تلاش کنید.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "busy"}
        className="w-fit rounded-md bg-brand-black px-6 py-3 text-btn text-text-inverse hover:bg-[#242424] disabled:opacity-50"
      >
        {status === "busy" ? "در حال ارسال..." : "ارسال پیام"}
      </button>
    </form>
  );
}
