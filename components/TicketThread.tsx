"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

export type ThreadMessage = {
  id: number;
  sender_name: string;
  sender_role: "customer" | "developer" | "admin";
  message: string;
  created_at: string;
};

function formatTime(iso: string) {
  if (!iso) return "";
  const d = new Date(iso.replace(" ", "T") + "Z");
  return new Intl.DateTimeFormat("fa-IR", { dateStyle: "short", timeStyle: "short" }).format(d);
}

const roleLabel: Record<ThreadMessage["sender_role"], string> = {
  customer: "مشتری",
  developer: "برنامه‌نویس",
  admin: "ادمین",
};

function SendButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-accent px-5 py-2 text-[13px] font-bold text-black transition hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60"
    >
      {pending ? "در حال ارسال..." : label}
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

/** Renders a ticket as a proper message thread (not a single overwritable
 *  reply) with a box to send another message. Staff-only close/reopen
 *  controls render when their respective actions are passed in. */
export default function TicketThread({
  ticketId,
  messages,
  status,
  sendAction,
  closeAction,
  reopenAction,
}: {
  ticketId: number;
  messages: ThreadMessage[];
  status: string;
  /** Server action — receives a FormData with `ticketId` + `message`. */
  sendAction: (formData: FormData) => void | Promise<void>;
  /** Staff-only. Omit for the customer-facing view. */
  closeAction?: (formData: FormData) => void | Promise<void>;
  reopenAction?: (formData: FormData) => void | Promise<void>;
}) {
  const [text, setText] = useState("");
  const isStaffView = Boolean(closeAction || reopenAction);

  async function handleSend(formData: FormData) {
    await sendAction(formData);
    setText("");
  }

  return (
    <div className="mt-4 flex flex-col gap-3">
      {messages.length > 0 && (
        <div className="flex flex-col gap-2.5 rounded-[10px] border border-ink/[0.12] bg-canvas/60 p-4">
          {messages.map((m) => {
            const fromCustomer = m.sender_role === "customer";
            return (
              <div key={m.id} className={`flex ${fromCustomer ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-[10px] px-3.5 py-2 ${
                    fromCustomer ? "border border-ink/[0.14] bg-surface/40" : "bg-accent/[0.12]"
                  }`}
                >
                  <div className="mb-1 flex items-center gap-2 font-mono text-[10.5px] text-dim">
                    <span className="font-bold">{m.sender_name}</span>
                    <span>· {roleLabel[m.sender_role]}</span>
                    {m.created_at && <span>· {formatTime(m.created_at)}</span>}
                  </div>
                  <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-ink/90">{m.message}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <form action={handleSend} className="flex flex-wrap items-end gap-2">
        <input type="hidden" name="ticketId" value={ticketId} />
        <textarea
          name="message"
          required
          rows={2}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="پیامت رو بنویس..."
          className="min-w-[220px] flex-1 resize-none rounded-[10px] border border-ink/[0.16] bg-surface/40 px-4 py-2.5 text-[14px] text-ink outline-none transition focus:border-accent"
        />
        <SendButton label={isStaffView ? "ارسال پاسخ" : "ارسال پیام"} />
      </form>

      {isStaffView && (
        <div className="flex flex-wrap gap-2">
          {status === "closed" ? (
            reopenAction && (
              <form action={reopenAction}>
                <input type="hidden" name="ticketId" value={ticketId} />
                <SmallButton>بازکردن دوباره</SmallButton>
              </form>
            )
          ) : (
            closeAction && (
              <form action={closeAction}>
                <input type="hidden" name="ticketId" value={ticketId} />
                <SmallButton>بستن تیکت</SmallButton>
              </form>
            )
          )}
        </div>
      )}
    </div>
  );
}
