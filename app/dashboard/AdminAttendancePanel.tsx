"use client";

import { useEffect, useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { deleteAttendanceAction, saveAttendanceAction, setWorkHoursAction, type AttendanceFormState } from "./actions";
import {
  earlyMinutes,
  fmtDay,
  fmtMinutes,
  fmtTime,
  isDayString,
  lateMinutes,
  sessionMinutes,
  shiftDay,
  tehranDay,
  tehranHHMM,
} from "@/lib/attendance";
import { Badge, groupByDay } from "./AttendancePanel";
import type { AttendanceRecord } from "@/lib/db";

type Staff = { id: number; name: string; title: string };

const inputClass =
  "w-full rounded-[10px] border border-ink/[0.16] bg-surface/40 px-3 py-2 text-[13.5px] text-ink outline-none transition focus:border-accent focus:bg-surface/70";
const labelClass = "mb-1 block text-[12px] font-semibold text-dim";
const fa = (n: number | string) => String(n).replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);

function Save({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-accent px-5 py-2 text-[13px] font-semibold text-black transition hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60"
    >
      {pending ? "..." : label}
    </button>
  );
}

function WorkHoursForm({ workHours }: { workHours: { start: string; end: string } }) {
  const [state, action] = useFormState<AttendanceFormState, FormData>(setWorkHoursAction, null);
  return (
    <form action={action} className="flex flex-wrap items-end gap-3 rounded-card border border-ink/[0.14] bg-surface/20 p-4">
      <div>
        <label className={labelClass}>شروع ساعت کاری</label>
        <input type="time" name="start" defaultValue={workHours.start} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>پایان ساعت کاری</label>
        <input type="time" name="end" defaultValue={workHours.end} className={inputClass} />
      </div>
      <Save label="ذخیره‌ی ساعت کاری" />
      <p className="basis-full text-[12px] text-dim">از روی این ساعت‌ها «تأخیر» (ورود دیرتر از شروع) و «خروج زودتر» محاسبه می‌شه.</p>
      {state && <p className={`basis-full text-[12.5px] font-semibold ${state.ok ? "text-emerald-600" : "text-red-500"}`}>{state.message}</p>}
    </form>
  );
}

/** Add a missed shift, or correct one (when `record` is given). */
function RecordForm({ staff, record, onDone }: { staff: Staff[]; record?: AttendanceRecord; onDone: () => void }) {
  const [state, action] = useFormState<AttendanceFormState, FormData>(saveAttendanceAction, null);
  useEffect(() => {
    if (state?.ok) {
      const t = setTimeout(onDone, 500);
      return () => clearTimeout(t);
    }
  }, [state, onDone]);
  const today = tehranDay();
  return (
    <form action={action} className="grid gap-3 rounded-lg border border-accent/30 bg-canvas/40 p-4 sm:grid-cols-2 lg:grid-cols-5">
      {record ? (
        <input type="hidden" name="recordId" value={record.id} />
      ) : (
        <div>
          <label className={labelClass}>کارشناس</label>
          <select name="userId" required className={inputClass} defaultValue="">
            <option value="" disabled>
              انتخاب کنید
            </option>
            {staff.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      )}
      <div>
        <label className={labelClass}>روز</label>
        <input type="date" name="day" required defaultValue={record?.day ?? today} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>ساعت ورود</label>
        <input type="time" name="checkIn" required defaultValue={record ? tehranHHMM(record.check_in) : "09:00"} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>ساعت خروج (خالی = هنوز باز)</label>
        <input type="time" name="checkOut" defaultValue={record?.check_out ? tehranHHMM(record.check_out) : ""} className={inputClass} />
      </div>
      <div className="flex items-end gap-2">
        <Save label={record ? "ذخیره" : "افزودن"} />
        <button type="button" onClick={onDone} className="rounded-full border border-ink/[0.2] px-4 py-2 text-[13px] font-semibold text-dim hover:border-accent hover:text-accent">
          انصراف
        </button>
      </div>
      {state && <p className={`text-[12.5px] font-semibold sm:col-span-2 lg:col-span-5 ${state.ok ? "text-emerald-600" : "text-red-500"}`}>{state.message}</p>}
    </form>
  );
}

/** Admin overview: who is at work now, per-person totals, and every record. */
export default function AdminAttendancePanel({
  records,
  staff,
  workHours,
}: {
  records: AttendanceRecord[];
  staff: Staff[];
  workHours: { start: string; end: string };
}) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);
  const today = now ? tehranDay(new Date(now)) : "";

  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [who, setWho] = useState<number | 0>(0);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Default range = last 30 days, once we know "today" on the client.
  useEffect(() => {
    if (today && !from) {
      setFrom(shiftDay(today, -29));
      setTo(today);
    }
  }, [today, from]);

  const names = useMemo(() => Object.fromEntries(staff.map((s) => [s.id, s])), [staff]);

  const todayList = useMemo(
    () =>
      staff.map((s) => {
        const mine = records.filter((r) => r.user_id === s.id && r.day === today);
        const g = now ? groupByDay(mine, now)[0] : undefined;
        const open = mine.find((r) => !r.check_out);
        const anyOpenStale = records.find((r) => r.user_id === s.id && !r.check_out && r.day !== today);
        return { s, g, open, stale: anyOpenStale };
      }),
    [staff, records, today, now]
  );

  const ranged = useMemo(
    () =>
      records
        .filter((r) => (!from || r.day >= from) && (!to || r.day <= to) && (!who || r.user_id === who))
        .sort((a, b) => (a.check_in < b.check_in ? 1 : -1)),
    [records, from, to, who]
  );

  const perPerson = useMemo(() => {
    if (!now) return [];
    return staff
      .filter((s) => !who || s.id === who)
      .map((s) => {
        const days = groupByDay(ranged.filter((r) => r.user_id === s.id), now);
        const minutes = days.reduce((sum, d) => sum + d.minutes, 0);
        const late = days.filter((d) => lateMinutes(d.first, d.day, workHours.start) > 0).length;
        const lateTotal = days.reduce((sum, d) => sum + lateMinutes(d.first, d.day, workHours.start), 0);
        return { s, days: days.length, minutes, late, lateTotal, avg: days.length ? minutes / days.length : 0 };
      });
  }, [staff, ranged, who, now, workHours.start]);

  if (staff.length === 0) {
    return <div className="rounded-card border border-dashed border-ink/[0.2] p-10 text-center text-dim">هنوز کارشناسی در تیم ثبت نشده.</div>;
  }

  return (
    <div className="space-y-6">
      <WorkHoursForm workHours={workHours} />

      {/* ---- today ---- */}
      <section>
        <h2 className="mb-3 font-display text-lg font-normal">امروز {today && <span className="text-[13px] text-dim">· {fmtDay(today)}</span>}</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {todayList.map(({ s, g, open, stale }) => {
            const late = g ? lateMinutes(g.first, g.day, workHours.start) : 0;
            return (
              <div
                key={s.id}
                className={`rounded-card border p-4 ${open ? "border-emerald-500/30 bg-emerald-500/[0.05]" : g ? "border-ink/[0.14] bg-surface/20" : "border-red-500/25 bg-red-500/[0.04]"}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold">{s.name}</p>
                    {s.title && <p className="text-[12px] text-dim">{s.title}</p>}
                  </div>
                  {open ? <Badge tone="ok">سر کار</Badge> : g ? <Badge tone="off">خارج شد</Badge> : <Badge tone="warn">هنوز نیومده</Badge>}
                </div>
                {g ? (
                  <div className="mt-3 space-y-0.5 text-[13px] text-dim">
                    <p>
                      ورود: <b className="text-ink">{fmtTime(g.first)}</b>
                      {late > 0 && <span className="text-amber-600"> · {fmtMinutes(late)} تأخیر</span>}
                    </p>
                    {g.last && (
                      <p>
                        خروج: <b className="text-ink">{fmtTime(g.last)}</b>
                        {earlyMinutes(g.last, g.day, workHours.end) > 0 && <span className="text-amber-600"> · {fmtMinutes(earlyMinutes(g.last, g.day, workHours.end))} زودتر</span>}
                      </p>
                    )}
                    <p>
                      مجموع: <b className="text-ink">{fmtMinutes(g.minutes)}</b>
                    </p>
                  </div>
                ) : (
                  <p className="mt-3 text-[13px] text-dim">امروز ورودی ثبت نکرده.</p>
                )}
                {stale && <p className="mt-2 text-[12px] text-amber-600">ورودِ {fmtDay(stale.day, false)} بدون خروج مونده.</p>}
              </div>
            );
          })}
        </div>
      </section>

      {/* ---- range + summary ---- */}
      <section className="rounded-card border border-ink/[0.14] bg-surface/20 p-5">
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <div>
            <label className={labelClass}>از تاریخ</label>
            <input type="date" value={from} max={to || undefined} onChange={(e) => isDayString(e.target.value) && setFrom(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>تا تاریخ</label>
            <input type="date" value={to} min={from || undefined} onChange={(e) => isDayString(e.target.value) && setTo(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>کارشناس</label>
            <select value={who} onChange={(e) => setWho(Number(e.target.value))} className={inputClass}>
              <option value={0}>همه</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-right text-[13.5px]">
            <thead>
              <tr className="border-b border-ink/[0.12] text-[12px] text-dim">
                <th className="px-3 py-2 font-semibold">کارشناس</th>
                <th className="px-3 py-2 font-semibold">روز حضور</th>
                <th className="px-3 py-2 font-semibold">مجموع ساعت کار</th>
                <th className="px-3 py-2 font-semibold">میانگین روزانه</th>
                <th className="px-3 py-2 font-semibold">روز تأخیر</th>
              </tr>
            </thead>
            <tbody>
              {perPerson.map((p) => (
                <tr key={p.s.id} className="border-b border-ink/[0.07] last:border-0">
                  <td className="px-3 py-2.5 font-semibold">{p.s.name}</td>
                  <td className="px-3 py-2.5">{fa(p.days)}</td>
                  <td className="px-3 py-2.5">{fmtMinutes(p.minutes)}</td>
                  <td className="px-3 py-2.5">{p.days ? fmtMinutes(p.avg) : "—"}</td>
                  <td className="px-3 py-2.5">{p.late ? <span className="text-amber-600">{fa(p.late)} روز · {fmtMinutes(p.lateTotal)}</span> : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ---- records ---- */}
      <section className="rounded-card border border-ink/[0.14] bg-surface/20 p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg font-normal">همه‌ی ورود و خروج‌ها ({fa(ranged.length)})</h2>
          {!adding && (
            <button
              type="button"
              onClick={() => {
                setAdding(true);
                setEditingId(null);
              }}
              className="rounded-full border border-accent/40 px-4 py-1.5 text-[12.5px] font-bold text-accent transition hover:bg-accent hover:text-black"
            >
              + افزودن دستی
            </button>
          )}
        </div>
        {adding && (
          <div className="mb-3">
            <RecordForm staff={staff} onDone={() => setAdding(false)} />
          </div>
        )}
        {ranged.length === 0 ? (
          <p className="py-6 text-center text-dim">در این بازه رکوردی نیست.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-right text-[13.5px]">
              <thead>
                <tr className="border-b border-ink/[0.12] text-[12px] text-dim">
                  <th className="px-3 py-2 font-semibold">کارشناس</th>
                  <th className="px-3 py-2 font-semibold">روز</th>
                  <th className="px-3 py-2 font-semibold">ورود</th>
                  <th className="px-3 py-2 font-semibold">خروج</th>
                  <th className="px-3 py-2 font-semibold">مدت</th>
                  <th className="px-3 py-2 font-semibold">وضعیت</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {ranged.map((r) =>
                  editingId === r.id ? (
                    <tr key={r.id}>
                      <td colSpan={7} className="px-1 py-2">
                        <RecordForm staff={staff} record={r} onDone={() => setEditingId(null)} />
                      </td>
                    </tr>
                  ) : (
                    <tr key={r.id} className="border-b border-ink/[0.07] last:border-0">
                      <td className="px-3 py-2.5 font-semibold">{names[r.user_id]?.name ?? "—"}</td>
                      <td className="px-3 py-2.5">{fmtDay(r.day)}</td>
                      <td className="px-3 py-2.5 font-mono">{fmtTime(r.check_in)}</td>
                      <td className="px-3 py-2.5 font-mono">{r.check_out ? fmtTime(r.check_out) : "…"}</td>
                      <td className="px-3 py-2.5">{fmtMinutes(sessionMinutes(r, now ?? 0))}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex flex-wrap gap-1.5">
                          {lateMinutes(r.check_in, r.day, workHours.start) > 0 && <Badge tone="warn">تأخیر</Badge>}
                          {r.auto_closed && <Badge tone="warn">خروج خودکار</Badge>}
                          {r.edited_by && <Badge tone="off">اصلاح‌شده</Badge>}
                          {!r.check_out && <Badge tone="info">باز</Badge>}
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(r.id);
                              setAdding(false);
                            }}
                            className="text-[12.5px] font-semibold text-dim transition hover:text-accent"
                          >
                            ویرایش
                          </button>
                          <form
                            action={deleteAttendanceAction}
                            onSubmit={(e) => {
                              if (!confirm("این رکورد حذف بشه؟")) e.preventDefault();
                            }}
                          >
                            <input type="hidden" name="recordId" value={r.id} />
                            <button type="submit" className="text-[12.5px] font-semibold text-red-500/90 transition hover:text-red-500">
                              حذف
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
