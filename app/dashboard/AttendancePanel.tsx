"use client";

import { useEffect, useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { clockInAction, clockOutAction, type ClockState } from "./actions";
import {
  earlyMinutes,
  fmtDay,
  fmtMinutes,
  fmtTime,
  lateMinutes,
  sessionMinutes,
  tehranDay,
  utcToMs,
  type SessionLike,
} from "@/lib/attendance";
import type { AttendanceRecord } from "@/lib/db";

const fa = (n: number | string) => String(n).replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);

type DayGroup = { day: string; sessions: AttendanceRecord[]; first: string; last: string | null; minutes: number };

/** Groups records by day (newest day first, sessions oldest→newest). */
export function groupByDay(records: AttendanceRecord[], nowMs: number): DayGroup[] {
  const map = new Map<string, AttendanceRecord[]>();
  for (const r of records) map.set(r.day, [...(map.get(r.day) ?? []), r]);
  return [...map.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([day, list]) => {
      const sessions = [...list].sort((a, b) => utcToMs(a.check_in) - utcToMs(b.check_in));
      const open = sessions.some((s) => !s.check_out);
      return {
        day,
        sessions,
        first: sessions[0].check_in,
        last: open ? null : sessions[sessions.length - 1].check_out,
        minutes: sessions.reduce((sum, s) => sum + sessionMinutes(s as SessionLike, nowMs), 0),
      };
    });
}

function ClockButton({ label, pendingLabel, tone }: { label: string; pendingLabel: string; tone: "in" | "out" }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`flex-1 rounded-2xl px-6 py-4 text-[16px] font-black transition hover:-translate-y-0.5 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60 ${
        tone === "in" ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/25" : "bg-red-500 text-white shadow-lg shadow-red-500/25"
      }`}
    >
      {pending ? pendingLabel : label}
    </button>
  );
}

/** The staff member's own clock-in / clock-out screen. */
export default function AttendancePanel({
  open,
  records,
  workHours,
}: {
  open: AttendanceRecord | null;
  records: AttendanceRecord[];
  workHours: { start: string; end: string };
}) {
  const [inState, inAction] = useFormState<ClockState, FormData>(clockInAction, null);
  const [outState, outAction] = useFormState<ClockState, FormData>(clockOutAction, null);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const nowMs = now ?? 0;
  const today = now ? tehranDay(new Date(now)) : "";
  const groups = useMemo(() => (now ? groupByDay(records, now) : []), [records, now]);
  const todayGroup = groups.find((g) => g.day === today);
  const isIn = !!open;
  const stale = !!open && !!today && open.day !== today;
  const message = outState ?? inState;

  // Last ~30 days summary.
  const summary = useMemo(() => {
    const days = groups.filter((g) => !!today && g.day <= today);
    const late = days.filter((g) => lateMinutes(g.first, g.day, workHours.start) > 0).length;
    return { days: days.length, minutes: days.reduce((s, g) => s + g.minutes, 0), late };
  }, [groups, today, workHours.start]);

  return (
    <div className="space-y-6">
      {/* -------- today / clock card -------- */}
      <div
        className={`overflow-hidden rounded-card border p-6 sm:p-8 ${
          isIn ? "border-emerald-500/30 bg-emerald-500/[0.05]" : "border-ink/[0.14] bg-surface/20"
        }`}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className={`inline-block h-3 w-3 rounded-full ${isIn ? "animate-pulse bg-emerald-500" : "bg-ink/30"}`} />
              <h2 className="font-display text-xl font-normal">{isIn ? "الان سر کار هستید" : "الان خارج از محل کار هستید"}</h2>
            </div>
            <p className="mt-1 text-[13px] text-dim">
              {today ? fmtDay(today) : "…"} · ساعت کاری: {fa(workHours.start)} تا {fa(workHours.end)}
            </p>
          </div>
          <div className="text-left">
            <p className="font-mono text-[34px] font-bold leading-none tabular-nums" dir="ltr">
              {now
                ? new Intl.DateTimeFormat("fa-IR", { timeZone: "Asia/Tehran", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }).format(
                    new Date(now)
                  )
                : "--:--:--"}
            </p>
            {isIn && open && now && (
              <p className="mt-1.5 text-[12.5px] text-emerald-600">
                از {fmtTime(open.check_in)} · {fmtMinutes(sessionMinutes(open, nowMs))} گذشته
              </p>
            )}
          </div>
        </div>

        {stale && (
          <p className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-[13px] leading-relaxed text-amber-700">
            ورودِ {fmtDay(open!.day, false)} بدون خروج مونده. با زدن هر کدوم از دکمه‌ها، اون ورود تا پایان ساعت کاری همون روز بسته می‌شه.
          </p>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <form action={inAction} className="flex flex-1">
            <ClockButton label="🟢 ثبت ورود" pendingLabel="در حال ثبت..." tone="in" />
          </form>
          <form
            action={outAction}
            className="flex flex-1"
            onSubmit={(e) => {
              if (!confirm("خروج ثبت بشه؟")) e.preventDefault();
            }}
          >
            <ClockButton label="🔴 ثبت خروج" pendingLabel="در حال ثبت..." tone="out" />
          </form>
        </div>
        {message && (
          <p className={`mt-4 text-[13.5px] font-semibold ${message.ok ? "text-emerald-600" : "text-red-500"}`} role="status">
            {message.message}
          </p>
        )}
      </div>

      {/* -------- today's sessions -------- */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="اولین ورود امروز" value={todayGroup ? fmtTime(todayGroup.first) : "—"} sub={
          todayGroup
            ? lateMinutes(todayGroup.first, todayGroup.day, workHours.start) > 0
              ? `${fmtMinutes(lateMinutes(todayGroup.first, todayGroup.day, workHours.start))} تأخیر`
              : "به‌موقع ✓"
            : undefined
        } tone={todayGroup && lateMinutes(todayGroup.first, todayGroup.day, workHours.start) > 0 ? "warn" : "ok"} />
        <Stat label="مجموع کار امروز" value={todayGroup ? fmtMinutes(todayGroup.minutes) : "—"} />
        <Stat
          label="خروج امروز"
          value={todayGroup?.last ? fmtTime(todayGroup.last) : todayGroup ? "هنوز نزدید" : "—"}
          sub={
            todayGroup?.last && earlyMinutes(todayGroup.last, todayGroup.day, workHours.end) > 0
              ? `${fmtMinutes(earlyMinutes(todayGroup.last, todayGroup.day, workHours.end))} زودتر از پایان کار`
              : undefined
          }
          tone={todayGroup?.last && earlyMinutes(todayGroup.last, todayGroup.day, workHours.end) > 0 ? "warn" : "ok"}
        />
      </div>

      {/* -------- summary + history -------- */}
      <div className="rounded-card border border-ink/[0.14] bg-surface/20 p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg font-normal">سابقه‌ی ۳۰ روز اخیر</h2>
          <p className="text-[12.5px] text-dim">
            {fa(summary.days)} روز حضور · مجموع {fmtMinutes(summary.minutes)} · {fa(summary.late)} روز تأخیر
          </p>
        </div>
        {groups.length === 0 ? (
          <p className="py-6 text-center text-dim">هنوز ورودی ثبت نکردید.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-right text-[13.5px]">
              <thead>
                <tr className="border-b border-ink/[0.12] text-[12px] text-dim">
                  <th className="px-3 py-2 font-semibold">روز</th>
                  <th className="px-3 py-2 font-semibold">ورود و خروج‌ها</th>
                  <th className="px-3 py-2 font-semibold">مجموع</th>
                  <th className="px-3 py-2 font-semibold">وضعیت</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((g) => {
                  const late = lateMinutes(g.first, g.day, workHours.start);
                  const auto = g.sessions.some((s) => s.auto_closed);
                  return (
                    <tr key={g.day} className="border-b border-ink/[0.07] align-top last:border-0">
                      <td className="px-3 py-2.5 font-semibold">{fmtDay(g.day)}</td>
                      <td className="px-3 py-2.5 font-mono text-[12.5px] text-dim" dir="ltr" style={{ textAlign: "right" }}>
                        {g.sessions.map((s) => (
                          <div key={s.id}>
                            {fmtTime(s.check_in)} → {s.check_out ? fmtTime(s.check_out) : "…"}
                          </div>
                        ))}
                      </td>
                      <td className="px-3 py-2.5">{fmtMinutes(g.minutes)}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex flex-wrap gap-1.5">
                          {late > 0 ? <Badge tone="warn">{fmtMinutes(late)} تأخیر</Badge> : <Badge tone="ok">به‌موقع</Badge>}
                          {auto && <Badge tone="warn">خروج خودکار</Badge>}
                          {g.sessions.some((s) => !s.check_out) && g.day === today && <Badge tone="info">در حال کار</Badge>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export function Badge({ tone, children }: { tone: "ok" | "warn" | "info" | "off"; children: React.ReactNode }) {
  const cls = {
    ok: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600",
    warn: "border-amber-500/40 bg-amber-500/10 text-amber-600",
    info: "border-accent/30 bg-accent/10 text-accent",
    off: "border-ink/[0.2] text-dim",
  }[tone];
  return <span className={`rounded-md border px-2 py-0.5 text-[11.5px] font-semibold ${cls}`}>{children}</span>;
}

function Stat({ label, value, sub, tone = "ok" }: { label: string; value: string; sub?: string; tone?: "ok" | "warn" }) {
  return (
    <div className="rounded-card border border-ink/[0.14] bg-surface/20 p-5">
      <p className="text-[12.5px] text-dim">{label}</p>
      <p className="mt-1 text-[22px] font-bold">{value}</p>
      {sub && <p className={`mt-0.5 text-[12.5px] font-semibold ${tone === "warn" ? "text-amber-600" : "text-emerald-600"}`}>{sub}</p>}
    </div>
  );
}
