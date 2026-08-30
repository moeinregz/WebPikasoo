"use client";

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
 *  has its own heading for this section. */
export default function TicketForm({ withHeading = true }: { withHeading?: boolean } = {}) {
  const [state, formAction] = useFormState(createSupportTicket, initialTicketState);
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
      {state && (
        <p className={`mt-3 text-sm ${state.ok ? "text-accent" : "text-dim"}`}>{state.message}</p>
      )}
    </form>
  );
}
