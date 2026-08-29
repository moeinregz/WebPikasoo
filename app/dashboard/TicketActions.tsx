"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { replyToTicketAction, closeTicketAction, reopenTicketAction } from "./actions";

function ReplyButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-accent px-5 py-2 text-[13px] font-bold text-black transition hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60"
    >
      {pending ? "در حال ارسال..." : "ارسال پاسخ و بستن تیکت"}
    </button>
  );
}

function SmallButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full border border-ink/[0.2] px-4 py-2 text-[12.5px] font-semibold text-dim transition hover:border-accent hover:text-accent disabled:pointer-events-none disabled:opacity-60"
    >
      {children}
    </button>
  );
}

/** Admin-only actions attached to a single ticket: write + send a reply
 *  (which also marks it closed), or close/reopen without writing one. */
export default function TicketActions({ ticketId, status }: { ticketId: number; status: string }) {
  const [replying, setReplying] = useState(false);

  if (status === "closed") {
    return (
      <form action={reopenTicketAction}>
        <input type="hidden" name="ticketId" value={ticketId} />
        <SmallButton>بازکردن دوباره</SmallButton>
      </form>
    );
  }

  if (!replying) {
    return (
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setReplying(true)}
          className="rounded-full bg-accent px-5 py-2 text-[13px] font-bold text-black transition hover:-translate-y-0.5"
        >
          پاسخ به تیکت
        </button>
        <form action={closeTicketAction}>
          <input type="hidden" name="ticketId" value={ticketId} />
          <SmallButton>بستن بدون پاسخ</SmallButton>
        </form>
      </div>
    );
  }

  return (
    <form action={replyToTicketAction} className="flex flex-col gap-3">
      <input type="hidden" name="ticketId" value={ticketId} />
      <textarea
        name="reply"
        required
        rows={3}
        autoFocus
        placeholder="پاسخت رو بنویس..."
        className="w-full resize-none rounded-[10px] border border-ink/[0.16] bg-surface/40 px-4 py-3 text-[14px] text-ink outline-none transition focus:border-accent"
      />
      <div className="flex flex-wrap gap-2">
        <ReplyButton />
        <button
          type="button"
          onClick={() => setReplying(false)}
          className="rounded-full border border-ink/[0.2] px-4 py-2 text-[12.5px] font-semibold text-dim transition hover:text-ink"
        >
          انصراف
        </button>
      </div>
    </form>
  );
}
