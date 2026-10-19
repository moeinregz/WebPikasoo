"use client";

import { useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { deleteWorkReportAction, markWorkReportAction, saveReportFeedbackAction, type ReportFormState } from "./actions";
import { fmtDateTime, fmtDay } from "@/lib/attendance";
import { Badge } from "./AttendancePanel";
import { ReportBody } from "./WorkReportPanel";
import SearchInput from "./SearchInput";
import type { WorkReport } from "@/lib/db";

type Staff = { id: number; name: string; title: string };
type Filter = "all" | "new" | "read";

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="rounded-full bg-accent px-4 py-1.5 text-[12.5px] font-bold text-black transition hover:-translate-y-0.5 disabled:opacity-60">
      {pending ? "..." : "ذخیره‌ی بازخورد"}
    </button>
  );
}

function FeedbackForm({ report }: { report: WorkReport }) {
  const [state, action] = useFormState<ReportFormState, FormData>(saveReportFeedbackAction, null);
  return (
    <form action={action} className="mt-4 rounded-lg border border-ink/[0.12] bg-canvas/40 p-3.5">
      <input type="hidden" name="reportId" value={report.id} />
      <label className="mb-1 block text-[12px] font-semibold text-dim">بازخورد شما برای این گزارش (برای کارشناس نمایش داده می‌شه)</label>
      <textarea
        name="feedback"
        rows={2}
        defaultValue={report.feedback}
        placeholder="مثلاً: ممنون؛ فردا روی مشتری‌های «قبول برای دیدن» تمرکز کن."
        className="w-full resize-y rounded-[10px] border border-ink/[0.16] bg-surface/40 px-3.5 py-2.5 text-[14px] leading-relaxed text-ink outline-none transition focus:border-accent"
      />
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <SaveButton />
        {state && <span className={`text-[12.5px] font-semibold ${state.ok ? "text-emerald-600" : "text-red-500"}`}>{state.message}</span>}
      </div>
    </form>
  );
}

/** Admin inbox of the work reports staff send. */
export default function AdminReportsPanel({ reports, staff }: { reports: WorkReport[]; staff: Staff[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [who, setWho] = useState(0);
  const [query, setQuery] = useState("");
  const names = useMemo(() => Object.fromEntries(staff.map((s) => [s.id, s])), [staff]);

  const counts = useMemo(
    () => ({ all: reports.length, new: reports.filter((r) => r.status === "new").length, read: reports.filter((r) => r.status === "read").length }),
    [reports]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reports.filter((r) => {
      if (filter !== "all" && r.status !== filter) return false;
      if (who && r.user_id !== who) return false;
      if (!q) return true;
      return [r.summary, r.issues, r.tomorrow, r.revenue, names[r.user_id]?.name].filter(Boolean).some((f) => f!.toLowerCase().includes(q));
    });
  }, [reports, filter, who, query, names]);

  const fa = (n: number) => n.toLocaleString("fa-IR");

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["all", "همه", counts.all],
              ["new", "خوانده‌نشده", counts.new],
              ["read", "خوانده‌شده", counts.read],
            ] as [Filter, string, number][]
          ).map(([k, label, n]) => (
            <button
              key={k}
              type="button"
              onClick={() => setFilter(k)}
              className={`rounded-full border px-4 py-1.5 text-[12.5px] font-bold transition ${
                filter === k ? "border-accent bg-accent text-black" : "border-ink/[0.18] text-dim hover:border-accent hover:text-accent"
              }`}
            >
              {label} · {fa(n)}
            </button>
          ))}
        </div>
        <select
          value={who}
          onChange={(e) => setWho(Number(e.target.value))}
          className="rounded-[10px] border border-ink/[0.16] bg-surface/40 px-3 py-2 text-[13px] text-ink outline-none focus:border-accent"
        >
          <option value={0}>همه‌ی کارشناس‌ها</option>
          {staff.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {reports.length === 0 ? (
        <div className="rounded-card border border-dashed border-ink/[0.2] p-8 sm:p-14 text-center text-dim">هنوز گزارشی نرسیده. کارشناس‌ها از تب «گزارش کار» خودشون می‌فرستن.</div>
      ) : (
        <>
          <SearchInput value={query} onChange={setQuery} placeholder="جستجو در متن گزارش‌ها یا نام کارشناس..." />
          {filtered.length === 0 ? (
            <div className="rounded-card border border-dashed border-ink/[0.2] p-6 sm:p-10 text-center text-dim">گزارشی با این فیلتر پیدا نشد.</div>
          ) : (
            <div className="flex flex-col gap-4">
              {filtered.map((r) => {
                const s = names[r.user_id];
                return (
                  <article key={r.id} className={`rounded-card border p-5 sm:p-6 ${r.status === "new" ? "border-accent/35 bg-accent/[0.04]" : "border-ink/[0.14] bg-surface/20"}`}>
                    <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-display text-lg font-normal">{s?.name ?? "کارشناس"}</h2>
                        {s?.title && <span className="text-[12.5px] text-dim">· {s.title}</span>}
                        <Badge tone="off">{fmtDay(r.day)}</Badge>
                        {r.status === "new" ? <Badge tone="info">جدید</Badge> : <Badge tone="ok">خوانده شد</Badge>}
                      </div>
                      <span className="font-mono text-xs text-dim/70">
                        ارسال: {fmtDateTime(r.created_at)}
                        {r.updated_at !== r.created_at && " (ویرایش‌شده)"}
                      </span>
                    </div>

                    <ReportBody r={r} />
                    <FeedbackForm report={r} />

                    <div className="mt-4 flex flex-wrap gap-2">
                      <form action={markWorkReportAction}>
                        <input type="hidden" name="reportId" value={r.id} />
                        <input type="hidden" name="status" value={r.status === "new" ? "read" : "new"} />
                        <button
                          type="submit"
                          className={`rounded-full border px-4 py-1.5 text-[12.5px] font-bold transition ${
                            r.status === "new"
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                              : "border-ink/[0.2] text-dim hover:border-accent hover:text-accent"
                          }`}
                        >
                          {r.status === "new" ? "خوندم ✓" : "علامت‌گذاری به‌عنوان جدید"}
                        </button>
                      </form>
                      <form
                        action={deleteWorkReportAction}
                        onSubmit={(e) => {
                          if (!confirm("این گزارش برای همیشه حذف بشه؟")) e.preventDefault();
                        }}
                      >
                        <input type="hidden" name="reportId" value={r.id} />
                        <button type="submit" className="rounded-full border border-red-500/30 px-4 py-1.5 text-[12.5px] font-semibold text-red-500/90 transition hover:bg-red-500/10">
                          حذف
                        </button>
                      </form>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
