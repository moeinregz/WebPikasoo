"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { deleteTicketAction } from "./actions";
import { formatDateTime } from "./format";
import SearchInput from "./SearchInput";
import type { TicketWithUser, TicketMessage } from "@/lib/db";

export default function TicketsPanel({
  tickets,
  ticketLastMessages,
  isAdmin,
}: {
  tickets: TicketWithUser[];
  ticketLastMessages: (TicketMessage | undefined)[];
  isAdmin: boolean;
}) {
  const [query, setQuery] = useState("");

  const filteredIndexes = useMemo(() => {
    const q = query.trim().toLowerCase();
    const indexes = tickets.map((_, i) => i);
    if (!q) return indexes;
    return indexes.filter((i) => {
      const t = tickets[i];
      const lastMessage = ticketLastMessages[i];
      return [t.subject, t.user_name, t.message, lastMessage?.message]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(q));
    });
  }, [tickets, ticketLastMessages, query]);

  if (tickets.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-ink/[0.2] p-14 text-center text-dim">
        به‌محض این‌که یه کاربر از حساب خودش تیکت بزنه، همین‌جا نشونش می‌دیم.
      </div>
    );
  }

  return (
    <div>
      <SearchInput value={query} onChange={setQuery} placeholder="جستجو بر اساس موضوع، کاربر یا متن پیام..." />

      {filteredIndexes.length === 0 ? (
        <div className="rounded-card border border-dashed border-ink/[0.2] p-10 text-center text-dim">
          نتیجه‌ای برای این جستجو پیدا نشد.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredIndexes.map((ticketIndex) => {
            const t = tickets[ticketIndex];
            const lastMessage = ticketLastMessages[ticketIndex];
            return (
              <div
                key={t.id}
                className="group flex items-center justify-between gap-4 rounded-card border border-ink/[0.14] bg-surface/20 p-5 transition hover:-translate-y-0.5 hover:border-accent/40 hover:bg-surface/40"
              >
                <Link href={`/dashboard/tickets/${t.id}`} className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-base font-normal">{t.subject}</h2>
                    <span
                      className={`rounded-md border px-2.5 py-0.5 font-mono text-[11px] ${
                        t.status === "open"
                          ? "border-accent/30 bg-accent/10 text-accent"
                          : "border-ink/[0.2] text-dim"
                      }`}
                    >
                      {t.status === "open" ? "باز" : "بسته"}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11.5px] text-dim">
                    <span>{t.user_name}</span>
                    <span aria-hidden="true">·</span>
                    <span className="truncate">{lastMessage ? lastMessage.message : t.message}</span>
                  </div>
                </Link>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="whitespace-nowrap font-mono text-xs text-dim/70">
                    {formatDateTime(t.created_at)}
                  </span>
                  {isAdmin && (
                    <form action={deleteTicketAction}>
                      <input type="hidden" name="ticketId" value={t.id} />
                      <button
                        type="submit"
                        className="rounded-full border border-red-500/30 px-3 py-1.5 text-[12px] font-semibold text-red-500/90 transition hover:bg-red-500/10"
                      >
                        حذف
                      </button>
                    </form>
                  )}
                  <Link href={`/dashboard/tickets/${t.id}`}>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      className="h-4 w-4 text-dim transition group-hover:translate-x-[-3px] group-hover:text-accent"
                    >
                      <path d="M15 6L9 12l6 6" />
                    </svg>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
