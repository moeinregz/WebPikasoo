"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createSupportTicket, type AccountFormState } from "@/app/account/actions";

const inputClass =
  "w-full rounded-[10px] border border-ink/[0.16] bg-surface/40 px-4 py-3 text-[14.5px] text-ink placeholder:text-dim/60 outline-none transition focus:border-accent focus:bg-surface/70";

function TicketSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-1 rounded-full bg-accent px-6 py-3 text-[14.5px] font-semibold text-black transition hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60"
    >
      {pending ? "در حال ثبت..." : "ثبت تیکت"}
    </button>
  );
}

const initialTicketState: AccountFormState = null;

/** A ready-to-drop-in "new support ticket" form — same server action
 *  (createSupportTicket) and styling used on the customer dashboard's
 *  tickets tab, factored out so the public contact page can offer the
 *  exact same ticket form without duplicating it. Requires a logged-in
 *  user (the server action itself checks this too); pass `withHeading` to
 *  hide the built-in "تیکت جدید" title when the surrounding page already
 *  has its own heading for this section.
 *
 *  On success the form itself just clears and stays put — the confirmation
 *  is a centered modal notification ("تیکت شما با موفقیت ثبت شد"), the
 *  same pattern used for the order-success notification in PricingPlans,
 *  so it's impossible to miss and doesn't hide the rest of the page. */
export default function TicketForm({ withHeading = true }: { withHeading?: boolean } = {}) {
  const [state, formAction] = useFormState(createSupportTicket, initialTicketState);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) {
      setShowSuccessModal(true);
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <>
      <form
        ref={formRef}
        action={formAction}
        className="relative overflow-hidden rounded-card border border-ink/[0.14] bg-surface/20 p-6"
      >
        <span
          className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full opacity-[0.12] blur-2xl"
          style={{ background: "#0077B6" }}
        />
        {withHeading && (
          <h2 className="relative mb-4 flex items-center gap-2 font-display text-lg font-normal">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5 text-accent">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            تیکت جدید
          </h2>
        )}
        <div className="relative flex flex-col gap-4">
          <input name="subject" required placeholder="موضوع" className={inputClass} />
          <textarea
            name="message"
            required
            rows={4}
            placeholder="توضیحاتت رو بنویس..."
            className={`${inputClass} resize-none`}
          />
        </div>
        <TicketSubmitButton />
        {state && !state.ok && (
          <p className="mt-3 text-sm text-dim">{state.message}</p>
        )}
      </form>

      {/* نوتیف وسط صفحه: تیکت با موفقیت ثبت شد — همون الگوی نوتیف موفقیت
          سفارش تو PricingPlans، برای این‌که هم قابل‌توجه باشه هم بقیه‌ی
          صفحه رو کامل مخفی نکنه. */}
      {showSuccessModal && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/55 p-5 backdrop-blur-sm"
          onClick={() => setShowSuccessModal(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[380px] rounded-card border border-emerald-500/30 bg-canvas p-7 text-center shadow-2xl"
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                className="h-6 w-6 text-emerald-600"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <h4 className="mb-2 font-display text-lg font-normal">تیکت شما با موفقیت ثبت شد</h4>
            <p className="mb-6 text-[13.5px] leading-relaxed text-dim">
              تیم وب پیکاسو به‌زودی بررسیش می‌کنه — یا باهات تماس می‌گیریم، یا جوابش رو همین‌جا
              داخل حساب کاربریت می‌بینی.
            </p>
            <button
              type="button"
              onClick={() => setShowSuccessModal(false)}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-ink px-4 py-3 text-[13.5px] font-bold text-canvas transition hover:-translate-y-0.5"
            >
              متوجه شدم
            </button>
          </div>
        </div>
      )}
    </>
  );
}
