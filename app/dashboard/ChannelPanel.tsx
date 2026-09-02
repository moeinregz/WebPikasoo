"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { useFormState, useFormStatus } from "react-dom";
import {
  createChannelLeadAction,
  setChannelResultAction,
  deleteChannelLeadAction,
  type ChannelFormState,
} from "./actions";
import { toPersianDigits } from "@/lib/auth";
import { CHANNEL_RESULT_OPTIONS, CHANNEL_NOT_MESSAGED_OPTION } from "@/lib/channelReport";
import SearchInput from "./SearchInput";
import Pagination from "./Pagination";

const PAGE_SIZE = 20;

type Channel = {
  id: number;
  page_name: string;
  business_name: string;
  note: string;
  messaged: number;
  created_at: string;
  created_by: number | null;
  last_message_result?: string;
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
      {pending ? "در حال ثبت..." : "افزودن پیج/کانال"}
    </button>
  );
}

const initialState: ChannelFormState = null;

function AddChannelForm() {
  const [state, formAction] = useFormState(createChannelLeadAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  // Clear the fields after a successful add, same reasoning as the CRM
  // form — registering several channels in a row shouldn't leave the
  // previous one's info sitting there.
  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="mb-6 rounded-card border border-ink/[0.14] bg-surface/20 p-6">
      <h2 className="mb-4 font-display text-lg font-normal">افزودن پیج/کانال جدید</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        <input name="pageName" required placeholder="نام پیج یا کانال" className={inputClass} />
        <input name="businessName" required placeholder="کسب‌وکار" className={inputClass} />
        <input name="note" placeholder="یادداشت — پلتفرم" className={inputClass} />
      </div>
      {state && <p className={`mt-3 text-sm ${state.ok ? "text-accent" : "text-red-500"}`}>{state.message}</p>}
      <SubmitButton />
    </form>
  );
}

// The dropdown's own option list: "not messaged" first, then the three
// outcomes — the exact four states this section tracks.
const STATUS_DROPDOWN_OPTIONS = [
  { label: CHANNEL_NOT_MESSAGED_OPTION.label, value: "", colorClass: CHANNEL_NOT_MESSAGED_OPTION.colorClass },
].concat(CHANNEL_RESULT_OPTIONS.map((opt) => ({ label: opt.label, value: opt.label, colorClass: opt.colorClass })));

/** One control per channel: a colored dropdown that IS the status — same
 *  pattern as CrmPanel's CallStatusCell (see there for why it's a custom
 *  panel of colored pills instead of a native <select>). */
function ChannelStatusCell({ channel }: { channel: Channel }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [value, setValue] = useState(channel.messaged ? channel.last_message_result || "" : "");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setValue(channel.messaged ? channel.last_message_result || "" : "");
  }, [channel.messaged, channel.last_message_result]);

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
    <form ref={formRef} action={setChannelResultAction} className="inline-block">
      <input type="hidden" name="channelId" value={channel.id} />
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
  // Fixed positioning (computed from the button's real screen position)
  // instead of `absolute` — the wrapper sits inside the table's
  // `overflow-x-auto` scroll box, which was clipping the options panel on
  // rows near the edge.
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (!open) return;
    function updatePosition() {
      const rect = wrapRef.current?.getBoundingClientRect();
      if (!rect) return;
      setPos({ top: rect.bottom + 6, left: rect.left });
    }
    updatePosition();
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

      {open && pos && (
        <div
          style={{ position: "fixed", top: pos.top, left: pos.left }}
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

export default function ChannelPanel({
  channels,
  canDelete = false,
  creatorNames = {},
}: {
  channels: Channel[];
  canDelete?: boolean;
  /** Admin-only: maps a channel's created_by user id to a display name.
   *  Empty for non-admins, who only ever see their own channels anyway
   *  (filtered server-side). */
  creatorNames?: Record<number, string>;
}) {
  const showCreator = Object.keys(creatorNames).length > 0 || canDelete;
  const messagedCount = channels.filter((c) => c.messaged).length;
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  // Exactly the four statuses this section tracks — nothing else. No
  // "همه"/"all" button among them; clicking whichever tab is already
  // active toggles it back off, same as the CRM tab's filters.
  const filterTabs = useMemo(
    () => [
      {
        key: "notMessaged",
        label: `${CHANNEL_NOT_MESSAGED_OPTION.label} (${toPersianDigits(channels.length - messagedCount)})`,
        activeClass: CHANNEL_NOT_MESSAGED_OPTION.colorClass,
      },
      ...CHANNEL_RESULT_OPTIONS.map((opt) => ({
        key: opt.label,
        label: `${opt.label} (${toPersianDigits(channels.filter((c) => c.messaged && c.last_message_result === opt.label).length)})`,
        activeClass: opt.colorClass,
      })),
    ],
    [channels, messagedCount]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return channels.filter((c) => {
      if (statusFilter === "notMessaged" && c.messaged) return false;
      if (statusFilter !== "all" && statusFilter !== "notMessaged" && c.last_message_result !== statusFilter)
        return false;
      if (!q) return true;
      return (
        c.page_name.toLowerCase().includes(q) ||
        c.business_name.toLowerCase().includes(q) ||
        (c.note && c.note.toLowerCase().includes(q))
      );
    });
  }, [channels, query, statusFilter]);

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
      <AddChannelForm />

      {channels.length === 0 ? (
        <div className="rounded-card border border-dashed border-ink/[0.2] p-8 sm:p-14 text-center text-dim">
          هنوز پیج/کانالی ثبت نشده.
        </div>
      ) : (
        <>
          <SearchInput value={query} onChange={setQuery} placeholder="جستجو بر اساس نام پیج، کسب‌وکار یا یادداشت..." />

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
            {toPersianDigits(messagedCount)} از {toPersianDigits(channels.length)} پیام داده شده
          </p>

          {filtered.length === 0 ? (
            <div className="rounded-card border border-dashed border-ink/[0.2] p-6 sm:p-10 text-center text-dim">
              نتیجه‌ای برای این فیلتر/جستجو پیدا نشد.
            </div>
          ) : (
            <>
              {/* Card list — phones/tablets, same reasoning as CrmPanel. */}
              <div className="flex flex-col gap-3 lg:hidden">
                {paged.map((c) => (
                  <div key={c.id} className="rounded-card border border-ink/[0.14] bg-surface/20 p-4">
                    <div className="min-w-0">
                      <p className="font-semibold text-[14.5px]">{c.page_name}</p>
                      <p className="mt-1 text-[13px] text-dim">{c.business_name}</p>
                    </div>
                    {c.note && <p className="mt-2 text-[13px] text-dim">{c.note}</p>}
                    {showCreator && (
                      <p className="mt-2 font-mono text-[11.5px] text-dim/70">ثبت‌کننده: {creatorLabel(c.created_by)}</p>
                    )}
                    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-ink/10 pt-3">
                      <ChannelStatusCell channel={c} />
                      {canDelete && (
                        <form action={deleteChannelLeadAction}>
                          <input type="hidden" name="channelId" value={c.id} />
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
                      <th className="px-5 py-3.5 font-semibold">پیج/کانال</th>
                      <th className="px-5 py-3.5 font-semibold">کسب‌وکار</th>
                      <th className="px-5 py-3.5 font-semibold">یادداشت</th>
                      <th className="px-5 py-3.5 font-semibold">وضعیت</th>
                      {showCreator && <th className="px-5 py-3.5 font-semibold">ثبت‌کننده</th>}
                      {canDelete && <th className="px-5 py-3.5 font-semibold"></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((c, i) => (
                      <tr key={c.id} className={i % 2 === 0 ? "bg-surface/20" : "bg-canvas"}>
                        <td className="px-5 py-3.5 font-semibold">{c.page_name}</td>
                        <td className="px-5 py-3.5 text-dim">{c.business_name}</td>
                        <td className="px-5 py-3.5 text-dim">{c.note || "—"}</td>
                        <td className="px-5 py-3.5">
                          <ChannelStatusCell channel={c} />
                        </td>
                        {showCreator && (
                          <td className="px-5 py-3.5 font-mono text-[12.5px] text-dim">{creatorLabel(c.created_by)}</td>
                        )}
                        {canDelete && (
                          <td className="px-5 py-3.5">
                            <form action={deleteChannelLeadAction}>
                              <input type="hidden" name="channelId" value={c.id} />
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
