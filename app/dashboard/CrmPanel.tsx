"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { createCrmLeadAction, setCrmCallResultAction, deleteCrmLeadAction, type CrmFormState } from "./actions";
import { toPersianDigits } from "@/lib/auth";
import { CRM_CALL_RESULT_OPTIONS, CRM_NOT_CALLED_OPTION } from "@/lib/crmReport";
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
  last_call_result?: string;
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

// The dropdown's own option list: "not called" first, then the three call
// outcomes — these are the exact four states the CRM tracks, so this list
// and the filter tabs below both come from the same source.
const STATUS_DROPDOWN_OPTIONS = [{ label: CRM_NOT_CALLED_OPTION.label, value: "", colorClass: CRM_NOT_CALLED_OPTION.colorClass }].concat(
  CRM_CALL_RESULT_OPTIONS.map((opt) => ({ label: opt.label, value: opt.label, colorClass: opt.colorClass }))
);

/** One control per lead: a colored dropdown that IS the status. Picking a
 *  result marks the lead called and shows that result as the button's own
 *  text/color (e.g. yellow "پاسخ نداد") — no separate "mark called" step.
 *  Picking "زنگ نزده" reverts to not-called.
 *
 *  Custom-built instead of a native <select> — a plain <select> opens the
 *  browser's own flat white list ("paper"), which can't carry the colors
 *  that make each status recognizable at a glance. This renders its own
 *  panel of colored option pills instead. */
function CallStatusCell({ lead }: { lead: Lead }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [value, setValue] = useState(lead.called ? lead.last_call_result || "" : "");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setValue(lead.called ? lead.last_call_result || "" : "");
  }, [lead.called, lead.last_call_result]);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const current = STATUS_DROPDOWN_OPTIONS.find((o) => o.value === value) ?? STATUS_DROPDOWN_OPTIONS[0];

  function choose(v: string) {
    setValue(v);
    setOpen(false);
    requestAnimationFrame(() => formRef.current?.requestSubmit());
  }

  return (
    <form ref={formRef} action={setCrmCallResultAction} className="inline-block">
      <input type="hidden" name="leadId" value={lead.id} />
      <input type="hidden" name="result" value={value} />
      <StatusDropdownButton wrapRef={wrapRef} open={open} setOpen={setOpen} current={current} onChoose={choose} />
    </form>
  );
}

function StatusDropdownButton({
  wrapRef,
  open,
  setOpen,
  current,
  onChoose,
}: {
  wrapRef: RefObject<HTMLDivElement>;
  open: boolean;
  setOpen: (v: boolean) => void;
  current: { label: string; value: string; colorClass: string };
  onChoose: (v: string) => void;
}) {
  const { pending } = useFormStatus();
  // The options panel used to be `absolute` inside the wrapper, which sits
  // inside the table's `overflow-x-auto` scroll box — so on rows near the
  // bottom/edge the panel got clipped by that scroll container instead of
  // floating over the page. Fixed positioning (computed from the button's
  // real screen position) escapes that clipping entirely.
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  // useLayoutEffect (not useEffect) so the flip/clamp math runs — and pos
  // updates — before the browser paints; the panel is rendered off-screen
  // and invisible until then, so there's no flash at the wrong spot.
  useLayoutEffect(() => {
    if (!open) {
      setPos(null);
      return;
    }
    function updatePosition() {
      const btnRect = wrapRef.current?.getBoundingClientRect();
      if (!btnRect) return;
      const menuRect = menuRef.current?.getBoundingClientRect();
      const menuHeight = menuRect?.height ?? 0;
      const menuWidth = menuRect?.width ?? 192;

      // Open upward when there isn't room below (e.g. the row is near the
      // bottom of the screen) but there IS more room above.
      const spaceBelow = window.innerHeight - btnRect.bottom;
      const spaceAbove = btnRect.top;
      const openUp = spaceBelow < menuHeight + 12 && spaceAbove > spaceBelow;
      const top = openUp ? Math.max(8, btnRect.top - menuHeight - 6) : btnRect.bottom + 6;

      // Keep it inside the viewport horizontally too (near the left/right edge).
      const maxLeft = window.innerWidth - menuWidth - 8;
      const left = Math.min(Math.max(btnRect.left, 8), Math.max(maxLeft, 8));

      setPos({ top, left });
    }
    updatePosition();
    // capture:true so scrolling *inside* the table wrapper (not just the
    // page) also repositions/tracks the button instead of leaving the
    // panel floating over the wrong row.
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, wrapRef]);

  return (
    <div ref={wrapRef} className="relative inline-block text-right">
      <button
        type="button"
        disabled={pending}
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[12.5px] font-bold outline-none transition disabled:opacity-60 ${current.colorClass}`}
      >
        {current.label}
        <svg
          viewBox="0 0 20 20"
          fill="none"
          className={`h-3 w-3 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M5 7.5 10 12.5 15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          ref={menuRef}
          style={{
            position: "fixed",
            top: pos ? pos.top : -9999,
            left: pos ? pos.left : -9999,
            visibility: pos ? "visible" : "hidden",
          }}
          className="z-50 w-48 rounded-2xl border border-ink/[0.14] bg-canvas p-1.5 shadow-2xl"
        >
          {STATUS_DROPDOWN_OPTIONS.map((opt) => (
            <button
              key={opt.value || "none"}
              type="button"
              onClick={() => onChoose(opt.value)}
              className={`mb-1 flex w-full items-center justify-between rounded-xl border px-3.5 py-2 text-[12.5px] font-bold transition last:mb-0 ${opt.colorClass} ${
                opt.value === current.value ? "brightness-110" : "opacity-70 hover:opacity-100"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
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
  const calledCount = leads.filter((l) => l.called).length;
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  // Exactly the four statuses the CRM tracks — nothing else. There's no
  // "همه"/"all" button among them; clicking whichever tab is already
  // active toggles it back off (see the button below), which is how you
  // get back to the unfiltered list.
  const filterTabs = useMemo(
    () => [
      {
        key: "notCalled",
        label: `${CRM_NOT_CALLED_OPTION.label} (${toPersianDigits(leads.length - calledCount)})`,
        activeClass: CRM_NOT_CALLED_OPTION.colorClass,
      },
      ...CRM_CALL_RESULT_OPTIONS.map((opt) => ({
        key: opt.label,
        label: `${opt.label} (${toPersianDigits(leads.filter((l) => l.called && l.last_call_result === opt.label).length)})`,
        activeClass: opt.colorClass,
      })),
    ],
    [leads, calledCount]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leads.filter((l) => {
      if (statusFilter === "notCalled" && l.called) return false;
      if (
        statusFilter !== "all" &&
        statusFilter !== "notCalled" &&
        l.last_call_result !== statusFilter
      )
        return false;
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
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter((prev) => (prev === tab.key ? "all" : tab.key))}
                className={`rounded-full border px-4 py-1.5 text-[12.5px] font-bold transition ${
                  statusFilter === tab.key
                    ? tab.activeClass
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
              نتیجه‌ای برای این فیلتر/جستجو پیدا نشد.
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
                      <CallStatusCell lead={l} />
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
                          <CallStatusCell lead={l} />
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
