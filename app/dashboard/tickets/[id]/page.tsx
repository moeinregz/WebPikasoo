import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Nav from "@/components/Nav";
import TicketThread from "@/components/TicketThread";
import { getCurrentUser } from "@/lib/session";
import { getTicketById, getTicketMessages, getUserById } from "@/lib/db";
import { toPersianDigits } from "@/lib/auth";
import { replyToTicketAction, closeTicketAction, reopenTicketAction, deleteTicketAction } from "../../actions";

function formatDate(iso: string) {
  const d = new Date(iso.replace(" ", "T") + "Z");
  return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(d);
}

export default async function StaffTicketPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user || !user.isStaff) redirect("/dashboard");

  const canReplyTickets = user.role === "admin" || user.permissions.tickets;
  if (!canReplyTickets) redirect("/dashboard");

  const ticketId = Number(params.id);
  const ticket = ticketId ? await getTicketById(ticketId) : undefined;
  if (!ticket) notFound();

  const messages = await getTicketMessages(ticket.id);
  const requester = await getUserById(ticket.user_id);

  return (
    <>
      <Nav isLoggedIn />
      <main className="mx-auto max-w-3xl px-6 py-14">
        <Link
          href="/dashboard"
          className="mb-5 inline-flex items-center gap-1.5 font-mono text-[12.5px] font-semibold text-dim transition hover:text-accent"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-[13px] w-[13px] rotate-180">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
          بازگشت به داشبورد
        </Link>

        {user.isAdmin && (
          <form action={deleteTicketAction} className="mb-5 flex justify-end">
            <input type="hidden" name="ticketId" value={ticket.id} />
            <button
              type="submit"
              className="rounded-full border border-red-500/40 px-4 py-1.5 text-[12.5px] font-semibold text-red-500 transition hover:bg-red-500/10"
            >
              حذف تیکت
            </button>
          </form>
        )}

        <div className="rounded-card border border-ink/[0.14] bg-surface/20 p-6">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="font-display text-xl font-normal">{ticket.subject}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[12.5px] text-dim">
                {requester && (
                  <>
                    <span>{requester.name}</span>
                    <span aria-hidden="true">·</span>
                    <Link href={`tel:${requester.phone}`} className="hover:text-accent" dir="ltr">
                      {toPersianDigits(requester.phone)}
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-md border px-3 py-1 font-mono text-xs ${
                  ticket.status === "open"
                    ? "border-accent/30 bg-accent/10 text-accent"
                    : "border-ink/[0.2] text-dim"
                }`}
              >
                {ticket.status === "open" ? "باز" : "بسته"}
              </span>
              <span className="whitespace-nowrap font-mono text-xs text-dim/70">{formatDate(ticket.created_at)}</span>
            </div>
          </div>
          <p className="whitespace-pre-wrap text-[14.5px] leading-relaxed text-ink/90">{ticket.message}</p>

          <TicketThread
            ticketId={ticket.id}
            status={ticket.status}
            messages={messages}
            sendAction={replyToTicketAction}
            closeAction={closeTicketAction}
            reopenAction={reopenTicketAction}
          />
        </div>
      </main>
    </>
  );
}
