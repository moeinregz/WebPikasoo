"use client";

import { useState } from "react";
import Link from "next/link";
import { logout } from "./actions";
import TicketForm from "@/components/TicketForm";
import type { ThreadMessage } from "@/components/TicketThread";

type ProjectItem = {
  id: number;
  created_at: string;
  project_type: string | null;
  budget: string | null;
  message: string;
};

type TicketItem = {
  id: number;
  created_at: string;
  subject: string;
  message: string;
  status: string;
  messages: ThreadMessage[];
};

// Kept local (not imported from lib/auth) so this client component never
// pulls in Node-only code — this file only needs plain string formatting.
function toPersianDigits(input: string | number) {
  const persian = "۰۱۲۳۴۵۶۷۸۹";
  return String(input).replace(/[0-9]/g, (d) => persian[Number(d)]);
}

function formatDate(iso: string) {
  const d = new Date(iso.replace(" ", "T") + "Z");
  return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" }).format(d);
}

// یه پالت کوچیک رنگ برای کارت‌های آماری و بج‌ها — همه از خانواده‌ی آبیِ
// برند (accent/accent2/accent3) به‌علاوه‌ی سبز برای «انجام‌شده»، بدون
// هیچ رنگ طلایی/نارنجیِ اضافه که با هویت برند جور نیست.
const STAT_COLORS = [
  { bg: "bg-accent/10", text: "text-accent", ring: "ring-accent/20" },
  { bg: "bg-accent3/10", text: "text-accent3", ring: "ring-accent3/25" },
  { bg: "bg-emerald-500/10", text: "text-emerald-600", ring: "ring-emerald-500/20" },
];

function StatCard({
  icon,
  label,
  value,
  colorIndex,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  colorIndex: number;
}) {
  const c = STAT_COLORS[colorIndex % STAT_COLORS.length];
  return (
    <div className={`flex items-center gap-3.5 rounded-card border border-ink/[0.1] bg-surface/40 p-5 ring-1 ${c.ring}`}>
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${c.bg} ${c.text}`}>
        {icon}
      </span>
      <div>
        <p className="font-display text-2xl font-normal leading-none">{toPersianDigits(value)}</p>
        <p className="mt-1 text-[12.5px] text-dim">{label}</p>
      </div>
    </div>
  );
}

function ProjectsPanel({ projects }: { projects: ProjectItem[] }) {
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-card border-2 border-dashed border-ink/[0.18] p-14 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-6 w-6">
            <path d="M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </span>
        <p className="max-w-[38ch] text-dim">
          هنوز درخواست پروژه‌ای ثبت نکردی — از فرم تماس تو صفحه‌ی اصلی می‌تونی یکی بفرستی.
        </p>
        <Link
          href="/#contact"
          className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-accent px-5 py-2.5 text-[13.5px] font-bold text-black transition hover:-translate-y-0.5"
        >
          رفتن به فرم تماس
        </Link>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-4">
      {projects.map((p) => (
        <article
          key={p.id}
          className="rounded-card border border-ink/[0.14] bg-surface/20 p-6 transition hover:border-accent/30 hover:bg-surface/40"
        >
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {p.project_type && (
                <span className="rounded-md border border-accent/30 bg-accent/10 px-3 py-1 font-mono text-xs text-accent">
                  {p.project_type}
                </span>
              )}
              {p.budget && (
                <span className="rounded-md border border-ink/[0.2] px-3 py-1 font-mono text-xs text-dim">
                  بودجه: {p.budget}
                </span>
              )}
            </div>
            <span className="whitespace-nowrap font-mono text-xs text-dim/70">
              {formatDate(p.created_at)}
            </span>
          </div>
          <p className="whitespace-pre-wrap text-[14.5px] leading-relaxed text-ink/90">{p.message}</p>
        </article>
      ))}
    </div>
  );
}

function TicketsPanel({ tickets }: { tickets: TicketItem[] }) {
  return (
    <div className="flex flex-col gap-8">
      <TicketForm />
      {tickets.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-card border-2 border-dashed border-ink/[0.18] p-14 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent3/10 text-accent3">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-6 w-6">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v4l2.5 2.5" />
            </svg>
          </span>
          <p className="text-dim">هنوز تیکتی نزدی — همه‌چی آرومه!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {tickets.map((t) => {
            const lastMessage = t.messages[t.messages.length - 1];
            return (
              <Link
                key={t.id}
                href={`/account/tickets/${t.id}`}
                className="group flex items-center justify-between gap-4 rounded-card border border-ink/[0.14] bg-surface/20 p-5 transition hover:-translate-y-0.5 hover:border-accent/40 hover:bg-surface/40"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-base font-normal">{t.subject}</h2>
                    <span
                      className={`rounded-md border px-2.5 py-0.5 font-mono text-[11px] ${
                        t.status === "open"
                          ? "border-accent/30 bg-accent/10 text-accent"
                          : "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
                      }`}
                    >
                      {t.status === "open" ? "باز" : "پاسخ داده شد"}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-[13px] text-dim">
                    {lastMessage ? lastMessage.message : t.message}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="whitespace-nowrap font-mono text-xs text-dim/70">{formatDate(t.created_at)}</span>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    className="h-4 w-4 text-dim transition group-hover:translate-x-[-3px] group-hover:text-accent"
                  >
                    <path d="M15 6L9 12l6 6" />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function UserDashboard({
  user,
  projects,
  tickets,
}: {
  user: { name: string; phone: string; createdAt: string };
  projects: ProjectItem[];
  tickets: TicketItem[];
}) {
  const [tab, setTab] = useState<"projects" | "tickets">("projects");
  const openTickets = tickets.filter((t) => t.status === "open").length;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <Link
        href="/"
        className="mb-5 inline-flex items-center gap-1.5 font-mono text-[12.5px] font-semibold text-dim transition hover:text-accent"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-[13px] w-[13px] rotate-180">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
        بازگشت به صفحه اصلی
      </Link>

      {/* بنر خوش‌آمد رنگی به‌جای هدر تخت قبلی — گرادیان ملایمِ آبیِ برند پشت کارت. */}
      <div className="relative mb-7 overflow-hidden rounded-card border border-ink/[0.1] bg-surface/40 p-7">
        <span
          className="pointer-events-none absolute -left-24 -top-24 h-56 w-56 rounded-full opacity-25 blur-[70px]"
          style={{ background: "linear-gradient(135deg, #0077B6, #00B4D8)" }}
        />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent text-white shadow-[0_6px_18px_-4px_rgba(0,119,182,0.5)]">
              <span className="font-display text-xl">{user.name.charAt(0)}</span>
            </div>
            <div>
              <h1 className="font-display text-xl font-normal">سلام {user.name.split(" ")[0]} 👋</h1>
              <p className="mt-0.5 font-mono text-sm text-dim" dir="ltr">
                {toPersianDigits(user.phone)}
              </p>
              <p className="mt-0.5 text-xs text-dim/70">عضو از {formatDate(user.createdAt)}</p>
            </div>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-full border-2 border-red-500/60 bg-red-500/[0.06] px-5 py-2.5 text-[13.5px] font-bold text-red-500 transition hover:bg-red-500 hover:text-white"
            >
              خروج از حساب
            </button>
          </form>
        </div>
      </div>

      {/* کارت‌های آماری رنگی — یه نگاه سریع قبل از رفتن سراغ تب‌ها. */}
      <div className="mb-7 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard
          colorIndex={0}
          value={projects.length}
          label="پروژه‌ی درخواستی"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
              <path d="M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          }
        />
        <StatCard
          colorIndex={1}
          value={openTickets}
          label="تیکت باز"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          }
        />
        <StatCard
          colorIndex={2}
          value={tickets.length - openTickets}
          label="تیکت پاسخ‌داده‌شده"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          }
        />
      </div>

      <div className="mb-7 inline-flex flex-wrap rounded-full border-2 border-navy p-1">
        <button
          type="button"
          onClick={() => setTab("projects")}
          className={`rounded-full px-5 py-2.5 text-[13.5px] font-bold transition ${
            tab === "projects" ? "bg-navy text-alabaster" : "text-dim hover:text-ink"
          }`}
        >
          پروژه‌های درخواستی ({toPersianDigits(projects.length)})
        </button>
        <button
          type="button"
          onClick={() => setTab("tickets")}
          className={`rounded-full px-5 py-2.5 text-[13.5px] font-bold transition ${
            tab === "tickets" ? "bg-navy text-alabaster" : "text-dim hover:text-ink"
          }`}
        >
          تیکت‌ها ({toPersianDigits(tickets.length)})
        </button>
      </div>

      {tab === "projects" ? <ProjectsPanel projects={projects} /> : <TicketsPanel tickets={tickets} />}
    </div>
  );
}
