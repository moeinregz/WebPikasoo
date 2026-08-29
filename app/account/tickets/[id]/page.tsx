import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Nav from "@/components/Nav";
import TicketThread from "@/components/TicketThread";
import { getCurrentUser } from "@/lib/session";
import { getTicketById, getTicketMessages } from "@/lib/db";
import { sendTicketMessageAction } from "../../actions";

function formatDate(iso: string) {
  const d = new Date(iso.replace(" ", "T") + "Z");
  return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(d);
}

export default async function CustomerTicketPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect("/account");
  if (user.isStaff) redirect("/dashboard");

  const ticketId = Number(params.id);
  const ticket = ticketId ? await getTicketById(ticketId) : undefined;
  if (!ticket || ticket.user_id !== user.id) notFound();

  const messages = await getTicketMessages(ticket.id);

  return (
    <>
      <Nav isLoggedIn />
      <main className="mx-auto max-w-3xl px-6 py-14">
        <Link
          href="/account"
          className="mb-5 inline-flex items-center gap-1.5 font-mono text-[12.5px] font-semibold text-dim transition hover:text-accent"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-[13px] w-[13px] rotate-180">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
          بازگشت به داشبورد
        </Link>

        <div className="rounded-card border border-ink/[0.14] bg-surface/20 p-6">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <h1 className="font-display text-xl font-normal">{ticket.subject}</h1>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-md border px-3 py-1 font-mono text-xs ${
                  ticket.status === "open"
                    ? "border-accent/30 bg-accent/10 text-accent"
                    : "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
                }`}
              >
                {ticket.status === "open" ? "باز" : "پاسخ داده شد"}
              </span>
              <span className="whitespace-nowrap font-mono text-xs text-dim/70">{formatDate(ticket.created_at)}</span>
            </div>
          </div>
          <p className="whitespace-pre-wrap text-[14.5px] leading-relaxed text-ink/90">{ticket.message}</p>

          <TicketThread ticketId={ticket.id} status={ticket.status} messages={messages} sendAction={sendTicketMessageAction} />
        </div>
      </main>
    </>
  );
}
