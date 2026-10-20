"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { submitWorkReportAction, updateWorkReportAction, deleteWorkReportAction, type ReportFormState } from "./actions";
import { fmtDateTime, fmtDay, tehranDay } from "@/lib/attendance";
import { Badge } from "./AttendancePanel";
import type { WorkReport, WorkStats } from "@/lib/db";

const inputClass =
  "w-full rounded-[10px] border border-ink/[0.16] bg-surface/40 px-3.5 py-2.5 text-[14px] text-ink placeholder:text-dim/60 outline-none transition focus:border-accent focus:bg-surface/70";
const labelClass = "mb-1 block text-[12px] font-semibold text-dim";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-accent px-6 py-2.5 text-[14px] font-semibold text-black transition hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60"
    >
      {pending ? "در حال ارسال..." : label}
    </button>
  );
}

/** What the CRM says this person did that day — counted by the server, so the
 *  sender never has to count calls or registered numbers by hand. */
export function StatsChips({ stats }: { stats: WorkStats }) {
  const fa = (n: number) => n.toLocaleString("fa-IR");
  const main: [string, number, string][] = [
    ["📞 تماس گرفته‌شده", stats.calls, "border-accent/30 bg-accent/10 text-accent"],
    ["➕ شماره‌ی ثبت‌شده", stats.leads, "border-ink/[0.2] bg-canvas/40 text-ink"],
    ["✅ قبول برای دیدن", stats.accepted, "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"],
    ["⏰ پیگیری انجام‌شده", stats.followups, "border-amber-500/40 bg-amber-500/10 text-amber-600"],
    ["🤝 سفارش ثبت‌شده", stats.orders, "border-violet-500/30 bg-violet-500/10 text-violet-500"],
  ];
  const results = Object.entries(stats.byResult).sort((a, b) => b[1] - a[1]);
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {main.map(([label, n, cls]) => (
          <span key={label} className={`rounded-lg border px-3 py-1.5 text-[12.5px] font-semibold ${cls}`}>
            {label}: <b className="text-[14px]">{fa(n)}</b>
          </span>
        ))}
      </div>
      {results.length > 0 && (
        <p className="text-[12px] leading-relaxed text-dim">
          نتیجه‌ی تماس‌ها: {results.map(([r, n]) => `${r} ${fa(n)}`).join(" · ")}
        </p>
      )}
    </div>
  );
}

/** Write (or edit) a work report for the admin. */
function ReportForm({ report, onDone, statsByDay }: { report?: WorkReport; onDone?: () => void; statsByDay: Record<string, WorkStats> }) {
  const editing = !!report;
  const [state, action] = useFormState<ReportFormState, FormData>(editing ? updateWorkReportAction : submitWorkReportAction, null);
  const ref = useRef<HTMLFormElement>(null);
  const today = tehranDay();
  const [day, setDay] = useState(report?.day ?? today);
  const stats = statsByDay[day] ?? (report && report.day === day ? report.stats : undefined);

  useEffect(() => {
    if (state?.ok) {
      if (!editing) ref.current?.reset();
      if (onDone) {
        const t = setTimeout(onDone, 600);
        return () => clearTimeout(t);
      }
    }
  }, [state, editing, onDone]);

  return (
    <form ref={ref} action={action} className="rounded-card border border-accent/30 bg-surface/20 p-5 sm:p-6">
      {report && <input type="hidden" name="reportId" value={report.id} />}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-normal">{editing ? "ویرایش گزارش" : "ارسال گزارش کار برای مدیر"}</h2>
          <p className="mt-1 text-[12.5px] leading-relaxed text-dim">
            {editing ? "تا وقتی مدیر گزارش رو نخونده می‌تونید ویرایشش کنید." : "کارهای انجام‌شده، نتیجه و مشکلات رو بنویسید؛ گزارش مستقیم برای مدیر ارسال می‌شه."}
          </p>
        </div>
        {onDone && (
          <button type="button" onClick={onDone} className="text-sm text-dim transition hover:text-ink">
            ✕
          </button>
        )}
      </div>

      <div className="mb-4 rounded-lg border border-emerald-500/25 bg-emerald-500/[0.05] p-3.5">
        <p className="mb-2 text-[12.5px] font-bold text-emerald-600">
          📊 آمار خودکار شما در {fmtDay(day, false)} — لازم نیست چیزی بشمارید؛ همین‌ها همراه گزارش برای مدیر ارسال می‌شه
        </p>
        {stats ? (
          <StatsChips stats={stats} />
        ) : (
          <p className="text-[12.5px] text-dim">برای این تاریخ آماری پیدا نشد.</p>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className={labelClass}>تاریخ گزارش</label>
          <input type="date" name="day" value={day} onChange={(e) => e.target.value && setDay(e.target.value)} max={today} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>مبلغ فروش</label>
          <input name="revenue" defaultValue={report?.revenue} placeholder="مثلاً ۱۲,۰۰۰,۰۰۰ تومان" className={inputClass} />
        </div>
        <div className="sm:col-span-2 lg:col-span-4">
          <label className={labelClass}>
            شرح کارهای انجام‌شده <span className="text-accent">*</span>
          </label>
          <textarea
            name="summary"
            required
            rows={5}
            defaultValue={report?.summary}
            placeholder="مثلاً: با ۴۰ مشتری تماس گرفتم، ۳ نفر قبول برای دیدن شدن، یک سفارش سایت فروشگاهی بستم و ..."
            className={`${inputClass} resize-y leading-relaxed`}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>مشکلات و نیازها</label>
          <textarea name="issues" rows={3} defaultValue={report?.issues} placeholder="اگه مشکلی بود یا چیزی لازم دارید بنویسید (اختیاری)" className={`${inputClass} resize-y leading-relaxed`} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>برنامه‌ی فردا</label>
          <textarea name="tomorrow" rows={3} defaultValue={report?.tomorrow} placeholder="کارهایی که فردا قصد انجامشون رو دارید (اختیاری)" className={`${inputClass} resize-y leading-relaxed`} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <SubmitButton label={editing ? "ذخیره‌ی تغییرات" : "ارسال گزارش"} />
        {state && (
          <p className={`text-[13px] font-semibold ${state.ok ? "text-emerald-600" : "text-red-500"}`} role="status">
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}

export function ReportBody({ r }: { r: WorkReport }) {
  const chips = [
    !r.stats && r.calls && `📞 ${Number(r.calls).toLocaleString("fa-IR")} تماس`,
    !r.stats && r.orders && `🤝 ${Number(r.orders).toLocaleString("fa-IR")} سفارش/قرارداد`,
    r.revenue && `💰 ${r.revenue}`,
  ].filter(Boolean) as string[];
  return (
    <div className="space-y-3">
      {r.stats && <StatsChips stats={r.stats} />}
      {chips.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {chips.map((c) => (
            <span key={c} className="rounded-md border border-ink/[0.18] bg-canvas/40 px-3 py-1 text-[12.5px] font-semibold">
              {c}
            </span>
          ))}
        </div>
      )}
      <p className="whitespace-pre-wrap text-[14.5px] leading-relaxed text-ink/90">{r.summary}</p>
      {r.issues && (
        <div className="rounded-lg border border-amber-500/25 bg-amber-500/[0.06] p-3.5">
          <p className="mb-1 text-[11.5px] font-bold text-amber-600">مشکلات و نیازها</p>
          <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-ink/85">{r.issues}</p>
        </div>
      )}
      {r.tomorrow && (
        <div className="rounded-lg border border-ink/[0.12] bg-canvas/40 p-3.5">
          <p className="mb-1 text-[11.5px] font-bold text-dim">برنامه‌ی فردا</p>
          <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-ink/85">{r.tomorrow}</p>
        </div>
      )}
    </div>
  );
}

/** The staff member's own reports: write a new one, see history + the admin's feedback. */
export default function WorkReportPanel({ reports, statsByDay }: { reports: WorkReport[]; statsByDay: Record<string, WorkStats> }) {
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13.5px] text-dim">گزارش‌های کاری شما برای مدیر؛ جواب مدیر هم همین‌جا زیر هر گزارش می‌آد.</p>
        {!creating && (
          <button
            type="button"
            onClick={() => {
              setCreating(true);
              setEditingId(null);
            }}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-[13.5px] font-bold text-black transition hover:-translate-y-0.5"
          >
            ✍️ گزارش جدید
          </button>
        )}
      </div>

      {creating && <ReportForm statsByDay={statsByDay} onDone={() => setCreating(false)} />}

      {reports.length === 0 && !creating ? (
        <div className="rounded-card border border-dashed border-ink/[0.2] p-8 sm:p-12 text-center text-dim">
          هنوز گزارشی نفرستادید. هر روز آخر وقت، یه گزارش کوتاه برای مدیر بفرستید.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {reports.map((r) =>
            editingId === r.id ? (
              <ReportForm key={r.id} report={r} statsByDay={statsByDay} onDone={() => setEditingId(null)} />
            ) : (
              <article
                key={r.id}
                className={`rounded-card border p-5 sm:p-6 ${r.status === "read" ? "border-emerald-500/25 bg-emerald-500/[0.04]" : "border-ink/[0.14] bg-surface/20"}`}
              >
                <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-lg font-normal">{fmtDay(r.day)}</h3>
                    {r.status === "read" ? <Badge tone="ok">مدیر خوند ✓</Badge> : <Badge tone="info">ارسال‌شده</Badge>}
                  </div>
                  <span className="font-mono text-xs text-dim/70">{fmtDateTime(r.created_at)}</span>
                </div>
                <ReportBody r={r} />
                {r.feedback && (
                  <div className="mt-4 rounded-lg border border-accent/30 bg-accent/[0.07] p-3.5">
                    <p className="mb-1 text-[11.5px] font-bold text-accent">بازخورد مدیر{r.feedback_at ? ` · ${fmtDateTime(r.feedback_at)}` : ""}</p>
                    <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-ink/90">{r.feedback}</p>
                  </div>
                )}
                {r.status === "new" && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(r.id);
                        setCreating(false);
                      }}
                      className="rounded-full border border-ink/[0.2] px-4 py-1.5 text-[12.5px] font-semibold text-dim transition hover:border-accent hover:text-accent"
                    >
                      ویرایش
                    </button>
                    <form
                      action={deleteWorkReportAction}
                      onSubmit={(e) => {
                        if (!confirm("این گزارش حذف بشه؟")) e.preventDefault();
                      }}
                    >
                      <input type="hidden" name="reportId" value={r.id} />
                      <button type="submit" className="rounded-full border border-red-500/30 px-4 py-1.5 text-[12.5px] font-semibold text-red-500/90 transition hover:bg-red-500/10">
                        حذف
                      </button>
                    </form>
                  </div>
                )}
              </article>
            )
          )}
        </div>
      )}
    </div>
  );
}
