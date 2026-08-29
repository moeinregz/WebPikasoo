import Link from "next/link";
import { toPersianDigits } from "@/lib/auth";

function formatDateTime(iso: string) {
  const d = new Date(iso.replace(" ", "T") + "Z");
  return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(d);
}

const STAT_THEMES = {
  blue: { bg: "bg-accent/10", text: "text-accent", ring: "ring-accent/20" },
  teal: { bg: "bg-accent3/10", text: "text-accent3", ring: "ring-accent3/25" },
  green: { bg: "bg-emerald-500/10", text: "text-emerald-500", ring: "ring-emerald-500/20" },
  amber: { bg: "bg-amber-500/10", text: "text-amber-500", ring: "ring-amber-500/25" },
} as const;

function StatCard({
  icon,
  label,
  value,
  sub,
  theme,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  sub?: string;
  theme: keyof typeof STAT_THEMES;
}) {
  const c = STAT_THEMES[theme];
  return (
    <div className={`rounded-card border border-ink/[0.1] bg-surface/40 p-5 ring-1 ${c.ring}`}>
      <div className="flex items-center gap-3.5">
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${c.bg} ${c.text}`}>
          {icon}
        </span>
        <div>
          <p className="font-display text-2xl font-normal leading-none">{toPersianDigits(value)}</p>
          <p className="mt-1 text-[12.5px] text-dim">{label}</p>
        </div>
      </div>
      {sub && <p className="mt-3 border-t border-ink/[0.08] pt-2.5 font-mono text-[11.5px] text-dim">{sub}</p>}
    </div>
  );
}

const icons = {
  orders: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
      <path d="M20 12V8H4v4M20 12v8H4v-8M20 12H4M8 8V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3" />
    </svg>
  ),
  ticket: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  team: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
      <path d="M16 18v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1M9 9a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM22 18v-1a4 4 0 0 0-3-3.87M15 2.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  task: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
      <path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
};

export type OverviewStats = {
  customers: number;
  team: number;
  inquiries: { total: number; new: number; followedUp: number };
  tickets: { total: number; open: number; closed: number };
  crmLeads: { total: number; called: number; notCalled: number };
  tasks: { total: number; open: number; done: number };
  recentInquiries: { id: number; name: string; created_at: string; status: string }[];
  recentTickets: { id: number; subject: string; user_name: string; created_at: string; status: string }[];
};

export default function OverviewPanel({ stats }: { stats: OverviewStats }) {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="mb-1 font-display text-xl font-normal">خلاصه‌ی وضعیت</h2>
        <p className="text-[13px] text-dim">یه نگاه کلی به همه‌چیز، قبل از رفتن سراغ جزئیات هر بخش.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard
          theme="blue"
          icon={icons.orders}
          value={stats.inquiries.total}
          label="سفارش‌ها"
          sub={`${toPersianDigits(stats.inquiries.new)} جدید · ${toPersianDigits(stats.inquiries.followedUp)} پیگیری‌شده`}
        />
        <StatCard
          theme="teal"
          icon={icons.ticket}
          value={stats.tickets.total}
          label="تیکت‌ها"
          sub={`${toPersianDigits(stats.tickets.open)} باز · ${toPersianDigits(stats.tickets.closed)} بسته`}
        />
        <StatCard theme="blue" icon={icons.users} value={stats.customers} label="کاربران ثبت‌نامی" />
        <StatCard theme="teal" icon={icons.team} value={stats.team} label="اعضای تیم" />
        <StatCard
          theme="amber"
          icon={icons.phone}
          value={stats.crmLeads.total}
          label="شماره‌های CRM"
          sub={`${toPersianDigits(stats.crmLeads.called)} تماس‌گرفته‌شده · ${toPersianDigits(stats.crmLeads.notCalled)} باقی‌مونده`}
        />
        <StatCard
          theme="green"
          icon={icons.task}
          value={stats.tasks.total}
          label="تسک‌های تیم"
          sub={`${toPersianDigits(stats.tasks.open)} باز · ${toPersianDigits(stats.tasks.done)} انجام‌شده`}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-card border border-ink/[0.14] bg-surface/20 p-5">
          <h3 className="mb-3 font-display text-base font-normal">آخرین سفارش‌ها</h3>
          {stats.recentInquiries.length === 0 ? (
            <p className="text-[13px] text-dim">هنوز سفارشی ثبت نشده.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-ink/[0.08]">
              {stats.recentInquiries.map((inq) => (
                <li key={inq.id} className="flex items-center justify-between gap-3 py-2.5 text-[13.5px]">
                  <span className="truncate font-semibold">{inq.name}</span>
                  <span className="flex shrink-0 items-center gap-2">
                    <span
                      className={`rounded-md border px-2 py-0.5 font-mono text-[10.5px] ${
                        inq.status === "followed_up"
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                          : "border-accent/30 bg-accent/10 text-accent"
                      }`}
                    >
                      {inq.status === "followed_up" ? "پیگیری شد" : "جدید"}
                    </span>
                    <span className="font-mono text-[11px] text-dim/70">{formatDateTime(inq.created_at)}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-card border border-ink/[0.14] bg-surface/20 p-5">
          <h3 className="mb-3 font-display text-base font-normal">آخرین تیکت‌ها</h3>
          {stats.recentTickets.length === 0 ? (
            <p className="text-[13px] text-dim">هنوز تیکتی ثبت نشده.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-ink/[0.08]">
              {stats.recentTickets.map((t) => (
                <li key={t.id}>
                  <Link
                    href={`/dashboard/tickets/${t.id}`}
                    className="flex items-center justify-between gap-3 py-2.5 text-[13.5px] transition hover:text-accent"
                  >
                    <span className="min-w-0 truncate">
                      <span className="font-semibold">{t.subject}</span>
                      <span className="text-dim"> — {t.user_name}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      <span
                        className={`rounded-md border px-2 py-0.5 font-mono text-[10.5px] ${
                          t.status === "open"
                            ? "border-accent/30 bg-accent/10 text-accent"
                            : "border-ink/[0.2] text-dim"
                        }`}
                      >
                        {t.status === "open" ? "باز" : "بسته"}
                      </span>
                      <span className="font-mono text-[11px] text-dim/70">{formatDateTime(t.created_at)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
