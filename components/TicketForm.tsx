"use client";

import { useEffect, useState } from "react";
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
 *  Once a ticket is submitted successfully, the form is swapped out for a
 *  confirmation message ("تیکت شما با موفقیت ثبت شد") instead of just
 *  showing a small note under the (still visible) empty form — the person
 *  gets a clear, unmistakable "done" screen, with a button to send another
 *  ticket if they need to. */
export default function TicketForm({ withHeading = true }: { withHeading?: boolean } = {}) {
  const [state, formAction] = useFormState(createSupportTicket, initialTicketState);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (state?.ok) setShowSuccess(true);
  }, [state]);

  if (showSuccess) {
    return (
      <div className="relative overflow-hidden rounded-card border border-ink/[0.14] bg-surface/20 p-8 text-center sm:p-10">
        <span
          className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full opacity-[0.12] blur-2xl"
          style={{ background: "#0077B6" }}
        />
        <span className="relative mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-8 w-8">
            <path d="m5 13 4 4L19 7" />
          </svg>
        </span>
        <h3 className="relative font-display text-xl font-normal sm:text-2xl">تیکت شما با موفقیت ثبت شد</h3>
        <p className="relative mx-auto mt-2 max-w-[42ch] text-sm text-dim">
          {state?.message || "تیکتت ثبت شد — به‌زودی جواب می‌دیم."}
        </p>
        <button
          type="button"
          onClick={() => setShowSuccess(false)}
          className="relative mt-6 inline-flex items-center gap-2 rounded-full border border-ink/[0.16] px-6 py-3 text-[14.5px] font-semibold text-ink transition hover:-translate-y-0.5 hover:border-accent/40 hover:text-accent"
        >
          ثبت تیکت جدید
        </button>
      </div>
    );
  }

  return (
    <form
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
  );
}
