"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { createCrmLeadAction, toggleCrmCalledAction, deleteCrmLeadAction, type CrmFormState } from "./actions";
import { toPersianDigits } from "@/lib/auth";
import SearchInput from "./SearchInput";
import Pagination from "./Pagination";

const PAGE_SIZE = 20;

type Lead = {
  id: number;
  name: string;
  phone: string;
  note: string;
  called: number;
  created_at: string;
  created_by: number | null;
};

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

function CalledToggle({ id, called }: { id: number; called: number }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`rounded-full border px-3.5 py-1.5 text-[12.5px] font-bold transition disabled:opacity-60 ${
        called
          ? "border-accent/30 bg-accent/10 text-accent"
          : "border-ink/[0.2] text-dim hover:border-accent hover:text-accent"
      }`}
    >
      {called ? "زنگ زده شد ✓" : "زنگ زده نشده"}
    </button>
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
  const calledCount = leads.filter((l) => l.called).length;
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "called" | "notCalled">("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leads.filter((l) => {
      if (statusFilter === "called" && !l.called) return false;
      if (statusFilter === "notCalled" && l.called) return false;
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
            {(
              [
                { key: "all", label: `همه (${toPersianDigits(leads.length)})` },
                { key: "called", label: `زنگ زده شده (${toPersianDigits(calledCount)})` },
                { key: "notCalled", label: `زنگ نزده (${toPersianDigits(leads.length - calledCount)})` },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                className={`rounded-full border px-4 py-1.5 text-[12.5px] font-bold transition ${
                  statusFilter === tab.key
                    ? "border-accent bg-accent text-black"
                    : "border-ink/[0.18] text-dim hover:border-accent hover:text-accent"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <p className="mb-4 font-mono text-[12.5px] text-dim">
            {toPersianDigits(calledCount)} از {toPersianDigits(leads.length)} تماس گرفته شده
          </p>

          {filtered.length === 0 ? (
            <div className="rounded-card border border-dashed border-ink/[0.2] p-6 sm:p-10 text-center text-dim">
              {statusFilter === "all"
                ? "نتیجه‌ای برای این جستجو پیدا نشد."
                : statusFilter === "called"
                ? "هیچ شماره‌ای که زنگ زده شده باشه پیدا نشد."
                : "هیچ شماره‌ی زنگ‌نزده‌ای پیدا نشد."}
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
                      <form action={toggleCrmCalledAction}>
                        <input type="hidden" name="leadId" value={l.id} />
                        <input type="hidden" name="called" value={l.called ? "0" : "1"} />
                        <CalledToggle id={l.id} called={l.called} />
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
                          <form action={toggleCrmCalledAction}>
                            <input type="hidden" name="leadId" value={l.id} />
                            <input type="hidden" name="called" value={l.called ? "0" : "1"} />
                            <CalledToggle id={l.id} called={l.called} />
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
