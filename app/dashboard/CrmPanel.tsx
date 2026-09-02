"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { createCrmLeadAction, updateCrmLeadStatusAction, deleteCrmLeadAction, type CrmFormState } from "./actions";
import { toPersianDigits } from "@/lib/auth";
import type { CrmLeadStatus } from "@/lib/db";
import SearchInput from "./SearchInput";
import Pagination from "./Pagination";

const PAGE_SIZE = 20;

type Lead = {
  id: number;
  name: string;
  phone: string;
  note: string;
  status: CrmLeadStatus;
  created_at: string;
  created_by: number | null;
};

/** Label + color for each call-outcome status. Colors are picked to read
 *  clearly apart at a glance: gray (untouched), blue (done), amber
 *  (no answer), red (rejected), emerald (best outcome). */
const STATUS_META: Record<CrmLeadStatus, { label: string; badge: string; dot: string }> = {
  not_called: {
    label: "زنگ نزده شده",
    badge: "border-ink/[0.2] bg-ink/[0.04] text-dim",
    dot: "bg-dim",
  },
  called: {
    label: "زنگ زده شده",
    badge: "border-accent/30 bg-accent/10 text-accent",
    dot: "bg-accent",
  },
  rejected: {
    label: "قبول نکرد",
    badge: "border-red-500/30 bg-red-500/10 text-red-500",
    dot: "bg-red-500",
  },
  no_answer: {
    label: "پاسخ نداد",
    badge: "border-amber-500/30 bg-amber-500/10 text-amber-500",
    dot: "bg-amber-500",
  },
  site_confirmed: {
    label: "تایید دیدن سایت",
    badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
    dot: "bg-emerald-500",
  },
};

const STATUS_ORDER: CrmLeadStatus[] = ["not_called", "called", "rejected", "no_answer", "site_confirmed"];

const inputClass =
  "w-full rounded-[10px] border border-ink/[0.16] bg-surface/40 px-4 py-3 text-[14.5px] text-ink placeholder:text-dim/60 outline-none transition focus:border-accent focus:bg-surface/70";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-1 rounded-full bg-accent px-6 py-3 text-[14.5px] font-semibold text-black transition hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60"
    >
      {pending ? "در حال ثبت..." : "افزودن شماره"}
    </button>
  );
}

const initialState: CrmFormState = null;

function AddLeadForm() {
  const [state, formAction] = useFormState(createCrmLeadAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  // Clear the fields after a successful add, so registering several
  // numbers in a row doesn't leave the previous one's info sitting there.
  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="mb-6 rounded-card border border-ink/[0.14] bg-surface/20 p-6">
      <h2 className="mb-4 font-display text-lg font-normal">افزودن شماره‌ی جدید به CRM</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        <input name="name" required placeholder="نام / نام کسب‌وکار" className={inputClass} />
        <input name="phone" required dir="ltr" placeholder="شماره تماس" className={inputClass} />
        <input name="note" placeholder="یادداشت (اختیاری)" className={inputClass} />
      </div>
      {state && <p className={`mt-3 text-sm ${state.ok ? "text-accent" : "text-red-500"}`}>{state.message}</p>}
      <SubmitButton />
    </form>
  );
}

/** Dropdown that submits its own form on change. Must sit inside the
 *  <form action={updateCrmLeadStatusAction}> it belongs to so useFormStatus
 *  can dim it while the update round-trips. */
function StatusSelect({ id, status }: { id: number; status: CrmLeadStatus }) {
  const { pending } = useFormStatus();
  const meta = STATUS_META[status];
  return (
    <div className="relative inline-flex">
      <span className={`pointer-events-none absolute right-3 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full ${meta.dot}`} />
      <select
        name="status"
        defaultValue={status}
        disabled={pending}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className={`appearance-none rounded-full border py-1.5 pl-3 pr-7 text-[12.5px] font-bold outline-none transition disabled:opacity-60 ${meta.badge}`}
      >
        {STATUS_ORDER.map((s) => (
          <option key={s} value={s} className="bg-canvas text-ink">
            {STATUS_META[s].label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function CrmPanel({
  leads,
  canDelete = false,
  creatorNames = {},
}: {
  leads: Lead[];
  canDelete?: boolean;
  /** Admin-only: maps a lead's created_by user id to a display name, so
   *  the admin can see who sourced each lead. Empty for non-admins, who
   *  only ever see their own leads anyway (filtered server-side). */
  creatorNames?: Record<number, string>;
}) {
  const showCreator = Object.keys(creatorNames).length > 0 || canDelete;
  const statusCounts = useMemo(() => {
    const counts = { not_called: 0, called: 0, rejected: 0, no_answer: 0, site_confirmed: 0 } as Record<
      CrmLeadStatus,
      number
    >;
    for (const l of leads) counts[l.status]++;
    return counts;
  }, [leads]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | CrmLeadStatus>("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leads.filter((l) => {
      if (statusFilter !== "all" && l.status !== statusFilter) return false;
      if (!q) return true;
      return (
        l.name.toLowerCase().includes(q) ||
        l.phone.includes(query.trim()) ||
        toPersianDigits(l.phone).includes(query.trim()) ||
        (l.note && l.note.toLowerCase().includes(q))
      );
    });
  }, [leads, query, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [query, statusFilter]);

  const paged = useMemo(() => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filtered, page]);

  function creatorLabel(id: number | null) {
    if (!id) return "—";
    return creatorNames[id] || `کاربر #${id}`;
  }

  return (
    <div>
      <AddLeadForm />

      {leads.length === 0 ? (
        <div className="rounded-card border border-dashed border-ink/[0.2] p-8 sm:p-14 text-center text-dim">
          هنوز شماره‌ای تو CRM ثبت نشده.
        </div>
      ) : (
        <>
          <SearchInput value={query} onChange={setQuery} placeholder="جستجو بر اساس نام، شماره یا یادداشت..." />

          <div className="mb-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`rounded-full border px-4 py-1.5 text-[12.5px] font-bold transition ${
                statusFilter === "all"
                  ? "border-accent bg-accent text-black"
                  : "border-ink/[0.18] text-dim hover:border-accent hover:text-accent"
              }`}
            >
              همه ({toPersianDigits(leads.length)})
            </button>
            {STATUS_ORDER.map((s) => {
              const meta = STATUS_META[s];
              const active = statusFilter === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatusFilter(s)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-[12.5px] font-bold transition ${
                    active ? meta.badge : "border-ink/[0.18] text-dim hover:border-accent hover:text-accent"
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
                  {meta.label} ({toPersianDigits(statusCounts[s])})
                </button>
              );
            })}
          </div>

          <p className="mb-4 font-mono text-[12.5px] text-dim">
            {toPersianDigits(statusCounts.called + statusCounts.site_confirmed)} از {toPersianDigits(leads.length)}{" "}
            پیگیری موفق
          </p>

          {filtered.length === 0 ? (
            <div className="rounded-card border border-dashed border-ink/[0.2] p-6 sm:p-10 text-center text-dim">
              {statusFilter === "all"
                ? "نتیجه‌ای برای این جستجو پیدا نشد."
                : `هیچ شماره‌ای با وضعیت «${STATUS_META[statusFilter].label}» پیدا نشد.`}
            </div>
          ) : (
            <>
              {/* Card list — phones/tablets. A side-scrolling table is
                  unusable with one thumb, so below the desktop breakpoint
                  each lead gets its own stacked card instead. */}
              <div className="flex flex-col gap-3 lg:hidden">
                {paged.map((l) => (
                  <div key={l.id} className="rounded-card border border-ink/[0.14] bg-surface/20 p-4">
                    <div className="min-w-0">
                      <p className="font-semibold text-[14.5px]">{l.name}</p>
                      <Link
                        href={`tel:${l.phone}`}
                        dir="ltr"
                        className="mt-1 inline-block font-mono text-[13px] text-dim hover:text-accent"
                      >
                        {toPersianDigits(l.phone)}
                      </Link>
                    </div>
                    {l.note && <p className="mt-2 text-[13px] text-dim">{l.note}</p>}
                    {showCreator && (
                      <p className="mt-2 font-mono text-[11.5px] text-dim/70">ثبت‌کننده: {creatorLabel(l.created_by)}</p>
                    )}
                    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-ink/10 pt-3">
                      <form action={updateCrmLeadStatusAction}>
                        <input type="hidden" name="leadId" value={l.id} />
                        <StatusSelect id={l.id} status={l.status} />
                      </form>
                      {canDelete && (
                        <form action={deleteCrmLeadAction}>
                          <input type="hidden" name="leadId" value={l.id} />
                          <button
                            type="submit"
                            className="rounded-full border border-red-500/30 px-3 py-1.5 text-[12px] font-semibold text-red-500/90 transition hover:bg-red-500/10"
                          >
                            حذف
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Table — desktop only. */}
              <div className="hidden overflow-x-auto rounded-card border border-ink/[0.14] lg:block">
                <table className="w-full min-w-[560px] border-collapse text-right text-[14px]">
                  <thead>
                    <tr className="bg-navy text-alabaster">
                      <th className="px-5 py-3.5 font-semibold">نام</th>
                      <th className="px-5 py-3.5 font-semibold">شماره</th>
                      <th className="px-5 py-3.5 font-semibold">یادداشت</th>
                      <th className="px-5 py-3.5 font-semibold">وضعیت تماس</th>
                      {showCreator && <th className="px-5 py-3.5 font-semibold">ثبت‌کننده</th>}
                      {canDelete && <th className="px-5 py-3.5 font-semibold"></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((l, i) => (
                      <tr key={l.id} className={i % 2 === 0 ? "bg-surface/20" : "bg-canvas"}>
                        <td className="px-5 py-3.5 font-semibold">{l.name}</td>
                        <td className="px-5 py-3.5 font-mono" dir="ltr">
                          <Link href={`tel:${l.phone}`} className="hover:text-accent">
                            {toPersianDigits(l.phone)}
                          </Link>
                        </td>
                        <td className="px-5 py-3.5 text-dim">{l.note || "—"}</td>
                        <td className="px-5 py-3.5">
                          <form action={updateCrmLeadStatusAction}>
                            <input type="hidden" name="leadId" value={l.id} />
                            <StatusSelect id={l.id} status={l.status} />
                          </form>
                        </td>
                        {showCreator && (
                          <td className="px-5 py-3.5 font-mono text-[12.5px] text-dim">{creatorLabel(l.created_by)}</td>
                        )}
                        {canDelete && (
                          <td className="px-5 py-3.5">
                            <form action={deleteCrmLeadAction}>
                              <input type="hidden" name="leadId" value={l.id} />
                              <button
                                type="submit"
                                className="rounded-full border border-red-500/30 px-3 py-1.5 text-[12px] font-semibold text-red-500/90 transition hover:bg-red-500/10"
                              >
                                حذف
                              </button>
                            </form>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Pagination page={page} totalItems={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />
            </>
          )}
        </>
      )}
    </div>
  );
}
