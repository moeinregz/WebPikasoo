"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import {
  createCrmLeadAction,
  setCrmCallResultAction,
  deleteCrmLeadAction,
  updateCrmLeadAction,
  saveCrmLeadNoteAction,
  checkCrmPhoneAction,
  toggleCrmFollowupAction,
  type CrmNoteState,
  type CrmFormState,
  type CrmEditFormState,
} from "./actions";
import { toPersianDigits } from "@/lib/auth";
import {
  CRM_ACCEPT_RESULT,
  CRM_NEED_FOLLOWUP_KEY,
  CRM_CALL_RESULT_OPTIONS,
  CRM_NOT_CALLED_OPTION,
  CRM_PROBLEM_STATUS_OPTIONS,
  getCrmProblemStatusColorClass,
} from "@/lib/crmReport";
import {
  CRM_BUSINESS_TYPES,
  CRM_TYPE_GROUPS_LABELED,
} from "@/lib/siteTemplates/crmMapping";
import { whatsappNumber } from "@/lib/siteTemplates/generate";
import SearchInput from "./SearchInput";
import Pagination from "./Pagination";

const PAGE_SIZE = 20;

type Lead = {
  id: number;
  name: string;
  phone: string;
  business_area: string;
  business_type: string;
  problem_status: string;
  called: number;
  created_at: string;
  created_by: number | null;
  last_call_result?: string;
  extra_phones?: string[];
  instagram?: string;
  whatsapp?: string;
  site_token?: string;
  legacy_business_type?: string;
  note?: string;
  accepted_at?: string;
  followup_done?: boolean;
  followup_done_at?: string;
};

const needsFollowup = (l: Lead) => !!l.called && l.last_call_result === CRM_ACCEPT_RESULT && !l.followup_done;

const MAX_EXTRA_PHONES = 4;

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

/** The 23 business types in groups. `extra` = values not in the list (old
 *  broad categories from before the list was expanded) — kept selectable so
 *  an existing lead's type is never silently lost. */
function BusinessTypeOptions({ extra = [] }: { extra?: string[] }) {
  const legacy = extra.filter((t) => t && !CRM_BUSINESS_TYPES.includes(t));
  return (
    <>
      {CRM_TYPE_GROUPS_LABELED.map((g) => (
        <optgroup key={g.label} label={g.label}>
          {g.types.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </optgroup>
      ))}
      {legacy.length > 0 && (
        <optgroup label="دسته‌های قدیمی">
          {legacy.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </optgroup>
      )}
    </>
  );
}

/** "Does this business have more numbers?" — any number of extra phone
 *  inputs (up to MAX_EXTRA_PHONES), all submitted as `extraPhone`. */
const toEnDigits = (v: string) =>
  v.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))).replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));

type PhoneStatus = "idle" | "checking" | "dup" | "free";

/** Asks the server — shortly after typing stops — whether this number is
 *  already in the CRM. Idle until it looks like a real number (8+ digits). */
function usePhoneStatus(value: string, ignoreLeadId?: number): PhoneStatus {
  const [status, setStatus] = useState<PhoneStatus>("idle");
  useEffect(() => {
    const digits = toEnDigits(value).replace(/\D/g, "");
    if (digits.length < 8) {
      setStatus("idle");
      return;
    }
    setStatus("checking");
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        const res = await checkCrmPhoneAction(value, ignoreLeadId);
        if (!cancelled) setStatus(res.duplicate ? "dup" : "free");
      } catch {
        if (!cancelled) setStatus("idle");
      }
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [value, ignoreLeadId]);
  return status;
}

const DUP_MESSAGE = "این شماره تکراریه — قبلاً تو CRM ثبت شده.";

/** A phone input that tells you "duplicate" as you type, and (via the
 *  browser's own validation) refuses to submit the form while it is one. */
function PhoneField({
  value,
  onChange,
  inputCls,
  ignoreLeadId,
  name,
  placeholder,
  required,
  inputMode,
}: {
  value: string;
  onChange: (v: string) => void;
  inputCls: string;
  ignoreLeadId?: number;
  name: string;
  placeholder: string;
  required?: boolean;
  inputMode?: "tel";
}) {
  const status = usePhoneStatus(value, ignoreLeadId);
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    ref.current?.setCustomValidity(status === "dup" ? DUP_MESSAGE : "");
  }, [status]);

  return (
    <div className="min-w-0 flex-1">
      <input
        ref={ref}
        name={name}
        dir="ltr"
        inputMode={inputMode}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-invalid={status === "dup"}
        className={`${inputCls} ${status === "dup" ? "!border-red-500 !bg-red-500/10" : status === "free" && ignoreLeadId === undefined ? "!border-emerald-500/50" : ""}`}
      />
      {status === "dup" && (
        <p className="mt-1 text-[12px] font-bold text-red-500" role="alert">
          ⚠️ {DUP_MESSAGE}
        </p>
      )}
      {/* "new number" only makes sense when adding, not when editing a lead's own numbers */}
      {status === "free" && ignoreLeadId === undefined && (
        <p className="mt-1 text-[11.5px] font-semibold text-emerald-600">✓ شماره‌ی جدیده</p>
      )}
      {status === "checking" && <p className="mt-1 text-[11.5px] text-dim">در حال بررسی...</p>}
    </div>
  );
}

function ExtraPhoneFields({
  initial = [],
  inputCls,
  small = false,
  ignoreLeadId,
}: {
  initial?: string[];
  inputCls: string;
  small?: boolean;
  ignoreLeadId?: number;
}) {
  const [phones, setPhones] = useState<string[]>(initial);
  return (
    <div className="flex flex-col gap-2">
      {phones.map((p, i) => (
        <div key={i} className="flex items-start gap-2">
          <PhoneField
            name="extraPhone"
            inputMode="tel"
            value={p}
            onChange={(v) => setPhones((prev) => prev.map((x, j) => (j === i ? v : x)))}
            placeholder="شماره‌ی دیگر"
            inputCls={inputCls}
            ignoreLeadId={ignoreLeadId}
          />
          <button
            type="button"
            onClick={() => setPhones((prev) => prev.filter((_, j) => j !== i))}
            className="whitespace-nowrap rounded-full border border-red-500/30 px-3 py-1.5 text-[12px] font-semibold text-red-500/90 transition hover:bg-red-500/10"
          >
            حذف
          </button>
        </div>
      ))}
      {phones.length < MAX_EXTRA_PHONES && (
        <button
          type="button"
          onClick={() => setPhones((prev) => [...prev, ""])}
          className={`self-start font-semibold text-accent transition hover:underline ${small ? "text-[12.5px]" : "text-[13px]"}`}
        >
          + شماره‌ی دیگر
        </button>
      )}
    </div>
  );
}

function AddLeadForm() {
  const [state, formAction] = useFormState(createCrmLeadAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  // Bumped after a successful add so the (stateful) extra-phone inputs
  // remount empty along with the form reset.
  const [resetKey, setResetKey] = useState(0);
  const [phone, setPhone] = useState("");

  // Clear the fields after a successful add, so registering several
  // numbers in a row doesn't leave the previous one's info sitting there.
  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      setPhone("");
      setResetKey((k) => k + 1);
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="mb-6 rounded-card border border-ink/[0.14] bg-surface/20 p-6">
      <h2 className="mb-4 font-display text-lg font-normal">افزودن شماره‌ی جدید به CRM</h2>
      <div className="grid gap-4 sm:grid-cols-5">
        <input name="name" required placeholder="نام / نام کسب‌وکار" className={inputClass} />
        <PhoneField name="phone" required value={phone} onChange={setPhone} placeholder="شماره تماس" inputCls={inputClass} />
        <input name="businessArea" placeholder="آدرس / منطقه‌ی کسب‌وکار (اختیاری)" className={inputClass} />
        <select name="businessType" defaultValue="" className={inputClass}>
          <option value="">نوع کسب‌وکار (اختیاری)</option>
          <BusinessTypeOptions />
        </select>
        <select name="problemStatus" defaultValue="" className={inputClass}>
          <option value="">وضعیت مشکل (اختیاری)</option>
          {CRM_PROBLEM_STATUS_OPTIONS.map((o) => (
            <option key={o.label} value={o.label}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <ExtraPhoneFields key={resetKey} inputCls={inputClass} />
        <input name="instagram" dir="ltr" placeholder="اینستاگرام (اختیاری) — @name" className={inputClass} />
        <input name="whatsapp" dir="ltr" inputMode="tel" placeholder="واتساپ (اختیاری)" className={inputClass} />
      </div>
      {state && <p className={`mt-3 text-sm ${state.ok ? "text-accent" : "text-red-500"}`}>{state.message}</p>}
      <SubmitButton />
    </form>
  );
}

function SaveEditButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-accent px-4 py-1.5 text-[12.5px] font-semibold text-black transition hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60"
    >
      {pending ? "در حال ذخیره..." : "ذخیره"}
    </button>
  );
}

const editInputClass =
  "w-full rounded-[10px] border border-ink/[0.16] bg-surface/40 px-3 py-2 text-[13px] text-ink outline-none transition focus:border-accent focus:bg-surface/70";

/** Main-admin only: edits everything on an existing lead — name, phones,
 *  area, type, problem status, Instagram, WhatsApp — pre-filled and
 *  submitted through updateCrmLeadAction. Rendered in place of the normal
 *  display for exactly one lead at a time (see `editingId` below). */
function EditLeadFields({ lead, onDone }: { lead: Lead; onDone: () => void }) {
  const [state, formAction] = useFormState(updateCrmLeadAction, null as CrmEditFormState);
  const [phone, setPhone] = useState(lead.phone);

  useEffect(() => {
    if (state?.ok) onDone();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="leadId" value={lead.id} />
      <div className="grid gap-2 sm:grid-cols-2">
        <input name="name" defaultValue={lead.name} placeholder="نام کسب‌وکار" required className={editInputClass} />
        <PhoneField
          name="phone"
          required
          value={phone}
          onChange={setPhone}
          placeholder="شماره‌ی اصلی"
          inputCls={editInputClass}
          ignoreLeadId={lead.id}
        />
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        <input
          name="businessArea"
          defaultValue={lead.business_area}
          placeholder="منطقه‌ی کسب‌وکار"
          className={editInputClass}
        />
        <select name="businessType" defaultValue={lead.business_type} className={editInputClass}>
          <option value="">نوع کسب‌وکار</option>
          <BusinessTypeOptions extra={[lead.business_type]} />
        </select>
        <select name="problemStatus" defaultValue={lead.problem_status} className={editInputClass}>
          <option value="">وضعیت مشکل</option>
          {CRM_PROBLEM_STATUS_OPTIONS.map((o) => (
            <option key={o.label} value={o.label}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        <ExtraPhoneFields initial={lead.extra_phones ?? []} inputCls={editInputClass} small ignoreLeadId={lead.id} />
        <input
          name="instagram"
          dir="ltr"
          defaultValue={lead.instagram ? `@${lead.instagram}` : ""}
          placeholder="اینستاگرام — @name"
          className={editInputClass}
        />
        <input name="whatsapp" dir="ltr" defaultValue={lead.whatsapp ?? ""} placeholder="واتساپ" className={editInputClass} />
      </div>
      {state && !state.ok && <p className="text-[12.5px] text-red-500">{state.message}</p>}
      <div className="flex items-center gap-2">
        <SaveEditButton />
        <button
          type="button"
          onClick={onDone}
          className="rounded-full border border-ink/[0.18] px-4 py-1.5 text-[12.5px] font-bold text-dim transition hover:border-accent hover:text-accent"
        >
          انصراف
        </button>
      </div>
    </form>
  );
}

/** Primary number first, then any extra numbers — one tap-to-call link each. */
function PhoneLinks({ lead, className = "" }: { lead: Lead; className?: string }) {
  const all = [lead.phone, ...(lead.extra_phones ?? [])];
  return (
    <div className={`flex flex-col items-start gap-0.5 ${className}`} dir="ltr">
      {all.map((p, i) => (
        <Link
          key={`${p}-${i}`}
          href={`tel:${p}`}
          className={`font-mono text-[13px] hover:text-accent ${i === 0 ? "" : "text-dim"}`}
        >
          {toPersianDigits(p)}
        </Link>
      ))}
    </div>
  );
}

/** Instagram / WhatsApp / generated-site shortcuts, shown only when present. */
function LeadChips({ lead }: { lead: Lead }) {
  const wa = lead.whatsapp ? whatsappNumber(lead.whatsapp) : null;
  if (!lead.instagram && !wa && !lead.site_token) return null;
  const chip =
    "rounded-full border border-ink/[0.16] bg-surface/40 px-2.5 py-1 text-[11.5px] font-semibold text-dim transition hover:border-accent hover:text-accent";
  return (
    <div className="mt-1.5 flex flex-wrap gap-1.5 font-normal">
      {lead.instagram && (
        <a href={`https://instagram.com/${lead.instagram}`} target="_blank" rel="noopener noreferrer" dir="ltr" className={chip}>
          📷 @{lead.instagram}
        </a>
      )}
      {wa && lead.whatsapp && (
        <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" dir="ltr" className={chip}>
          💬 {toPersianDigits(lead.whatsapp)}
        </a>
      )}
      {lead.site_token && (
        <a href={`/preview/${lead.site_token}`} target="_blank" rel="noopener noreferrer" className={chip}>
          🌐 سایت ساخته‌شده
        </a>
      )}
    </div>
  );
}

/** Per-lead extras that have nothing to do with the site builder:
 *  - for leads that accepted the demo («قبول برای دیدن»): a «پیگیری» tick — it
 *    stays unticked (a reminder) until you've followed up after sending the
 *    site, then you tick it;
 *  - a free-text note. */
function LeadExtras({ lead }: { lead: Lead }) {
  const accepted = !!lead.called && lead.last_call_result === CRM_ACCEPT_RESULT;
  const [editing, setEditing] = useState(false);
  const [state, action] = useFormState<CrmNoteState, FormData>(saveCrmLeadNoteAction, null);
  useEffect(() => {
    if (state?.ok) setEditing(false);
  }, [state]);

  const done = !!lead.followup_done;
  let days: number | null = null;
  if (accepted && lead.accepted_at) {
    days = Math.max(0, Math.floor((Date.now() - new Date(lead.accepted_at.replace(" ", "T") + "Z").getTime()) / 86400000));
  }
  const small =
    "rounded-full border border-ink/[0.16] bg-surface/40 px-2.5 py-1 text-[11.5px] font-semibold text-dim transition hover:border-accent hover:text-accent";

  return (
    <div className="mt-2 space-y-2 font-normal">
      {accepted && (
        <form action={toggleCrmFollowupAction}>
          <input type="hidden" name="leadId" value={lead.id} />
          <input type="hidden" name="done" value={done ? "0" : "1"} />
          <button
            type="submit"
            title={done ? "برای برگرداندن به «پیگیری نشده» کلیک کنید" : "بعد از پیگیری، تیک بزنید"}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12px] font-bold transition ${
              done
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                : "border-amber-500/50 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20"
            }`}
          >
            <span
              aria-hidden="true"
              className={`grid h-4 w-4 place-items-center rounded-[5px] border-2 text-[11px] leading-none ${
                done ? "border-emerald-500 bg-emerald-500 text-white" : "border-amber-500"
              }`}
            >
              {done ? "✓" : ""}
            </span>
            {done ? "پیگیری شد" : "پیگیری"}
            {!done && days !== null && (
              <span className="font-normal opacity-80" suppressHydrationWarning>
                · {days === 0 ? "امروز قبول کرد" : `${toPersianDigits(days)} روز پیش قبول کرد`}
              </span>
            )}
          </button>
        </form>
      )}

      {editing ? (
        <form action={action} className="rounded-lg border border-accent/30 bg-canvas/40 p-2.5">
          <input type="hidden" name="leadId" value={lead.id} />
          <textarea
            name="note"
            rows={3}
            autoFocus
            defaultValue={lead.note ?? ""}
            placeholder="یادداشت درباره‌ی این کسب‌وکار..."
            className="w-full resize-y rounded-[8px] border border-ink/[0.16] bg-surface/40 px-3 py-2 text-[13px] leading-relaxed text-ink outline-none transition focus:border-accent"
          />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button type="submit" className="rounded-full bg-accent px-4 py-1.5 text-[12px] font-bold text-black">
              ذخیره
            </button>
            <button type="button" onClick={() => setEditing(false)} className={small}>
              انصراف
            </button>
            {state && !state.ok && <span className="text-[12px] font-semibold text-red-500">{state.message}</span>}
          </div>
        </form>
      ) : lead.note ? (
        <div className="rounded-lg border border-amber-500/25 bg-amber-500/[0.06] px-3 py-2">
          <p className="whitespace-pre-wrap break-words text-[12.5px] leading-relaxed text-ink/85">📝 {lead.note}</p>
          <button type="button" onClick={() => setEditing(true)} className="mt-1 text-[11.5px] font-semibold text-dim transition hover:text-accent">
            ویرایش یادداشت
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => setEditing(true)} className={small}>
          📝 یادداشت
        </button>
      )}
    </div>
  );
}

/** Plain confirmation shown before a lead is set to «قبول برای دیدن». */
function AcceptConfirmDialog({
  lead,
  onConfirm,
  onCancel,
}: {
  lead: Lead;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="w-full max-w-sm rounded-card border border-ink/[0.14] bg-canvas p-6 text-right shadow-2xl">
        <h3 className="mb-2 font-display text-lg font-normal">مطمئنی؟</h3>
        <p className="mb-5 text-[13.5px] leading-relaxed text-dim">
          «{lead.name}» روی «{CRM_ACCEPT_RESULT}» ثبت بشه؟ سایتش ساخته می‌شه و لینکش تو چت تیم فرستاده می‌شه.
        </p>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-ink/[0.18] px-5 py-2.5 text-[13.5px] font-bold text-dim transition hover:border-accent hover:text-accent"
          >
            انصراف
          </button>
          <button
            type="button"
            onClick={onConfirm}
            autoFocus
            className="rounded-full bg-accent px-5 py-2.5 text-[13.5px] font-semibold text-black transition hover:-translate-y-0.5"
          >
            بله، ثبت کن
          </button>
        </div>
      </div>
    </div>,
    document.body
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
  // «قبول برای دیدن» needs an "are you sure?" first; `confirmed` is what tells
  // the server the dialog was approved (only then does it build the site).
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
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
    setOpen(false);
    if (v === CRM_ACCEPT_RESULT && value !== CRM_ACCEPT_RESULT) {
      // Nothing is saved until the dialog is confirmed.
      setConfirmOpen(true);
      return;
    }
    setConfirmed(false);
    setValue(v);
    requestAnimationFrame(() => formRef.current?.requestSubmit());
  }

  function confirmAccept() {
    setConfirmOpen(false);
    setConfirmed(true);
    setValue(CRM_ACCEPT_RESULT);
    requestAnimationFrame(() => formRef.current?.requestSubmit());
  }

  return (
    <>
      <form ref={formRef} action={setCrmCallResultAction} className="inline-block">
        <input type="hidden" name="leadId" value={lead.id} />
        <input type="hidden" name="result" value={value} />
        {confirmed && <input type="hidden" name="confirm" value="1" />}
        <StatusDropdownButton wrapRef={wrapRef} open={open} setOpen={setOpen} current={current} onChoose={choose} />
      </form>
      {confirmOpen && (
        <AcceptConfirmDialog lead={lead} onConfirm={confirmAccept} onCancel={() => setConfirmOpen(false)} />
      )}
    </>
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
      const menuWidth = menuRect?.width ?? 224;

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
        className={`flex min-w-[9.5rem] items-center justify-between gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-[12.5px] font-bold leading-none outline-none transition disabled:opacity-60 ${current.colorClass}`}
      >
        {pending && current.value === CRM_ACCEPT_RESULT ? "در حال ساخت سایت..." : current.label}
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
          className="z-50 w-56 rounded-2xl border border-ink/[0.14] bg-canvas p-1.5 shadow-2xl"
        >
          {STATUS_DROPDOWN_OPTIONS.map((opt) => (
            <button
              key={opt.value || "none"}
              type="button"
              onClick={() => onChoose(opt.value)}
              className={`mb-1 flex w-full items-center justify-between whitespace-nowrap rounded-xl border px-4 py-2.5 text-[12.5px] font-bold leading-none transition last:mb-0 ${opt.colorClass} ${
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
  canEdit = false,
  creatorNames = {},
}: {
  leads: Lead[];
  canDelete?: boolean;
  /** Owner-only: shows a "ویرایش" button per lead for filling in/correcting
   *  business area/type and problem status after the fact. Separate from
   *  canDelete — set specifically for the one main-admin account (see
   *  MAIN_ADMIN_PHONE), not every admin. */
  canEdit?: boolean;
  /** Admin-only: maps a lead's created_by user id to a display name, so
   *  the admin can see who sourced each lead. Empty for non-admins, who
   *  only ever see their own leads anyway (filtered server-side). */
  creatorNames?: Record<number, string>;
}) {
  const showCreator = Object.keys(creatorNames).length > 0 || canDelete;
  const calledCount = leads.filter((l) => l.called).length;
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  // At most one lead being edited at a time.
  const [editingId, setEditingId] = useState<number | null>(null);
  // "" for both means no filter applied — kept separate from the call-status
  // tabs above since these two are independent axes (a lead can be
  // "no website" + "not called" at the same time).
  const [businessTypeFilter, setBusinessTypeFilter] = useState<string>("");
  const [problemStatusFilter, setProblemStatusFilter] = useState<string>("");
  const [page, setPage] = useState(1);

  // Exactly the four statuses the CRM tracks — nothing else. There's no
  // "همه"/"all" button among them; clicking whichever tab is already
  // active toggles it back off (see the button below), which is how you
  // get back to the unfiltered list.
  const filterTabs = useMemo(
    () => [
      {
        key: CRM_NEED_FOLLOWUP_KEY,
        label: `⏰ نیاز به پیگیری (${toPersianDigits(leads.filter(needsFollowup).length)})`,
        activeClass: "border-amber-500/50 bg-amber-500/15 text-amber-600",
      },
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
      if (statusFilter === CRM_NEED_FOLLOWUP_KEY && !needsFollowup(l)) return false;
      if (statusFilter === "notCalled" && l.called) return false;
      if (
        statusFilter !== "all" &&
        statusFilter !== "notCalled" &&
        statusFilter !== CRM_NEED_FOLLOWUP_KEY &&
        l.last_call_result !== statusFilter
      )
        return false;
      if (businessTypeFilter && l.business_type !== businessTypeFilter) return false;
      if (problemStatusFilter && l.problem_status !== problemStatusFilter) return false;
      if (!q) return true;
      return (
        l.name.toLowerCase().includes(q) ||
        l.phone.includes(query.trim()) ||
        toPersianDigits(l.phone).includes(query.trim()) ||
        (l.extra_phones ?? []).some((p) => p.includes(query.trim()) || toPersianDigits(p).includes(query.trim())) ||
        (l.instagram ?? "").toLowerCase().includes(q.replace(/^@/, "")) ||
        (l.note ?? "").toLowerCase().includes(q) ||
        (l.business_area && l.business_area.toLowerCase().includes(q))
      );
    });
  }, [leads, query, statusFilter, businessTypeFilter, problemStatusFilter]);

  useEffect(() => {
    setPage(1);
  }, [query, statusFilter, businessTypeFilter, problemStatusFilter]);

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
          <SearchInput value={query} onChange={setQuery} placeholder="جستجو بر اساس نام، شماره یا منطقه..." />

          {statusFilter !== CRM_NEED_FOLLOWUP_KEY && leads.some(needsFollowup) && (
            <button
              type="button"
              onClick={() => setStatusFilter(CRM_NEED_FOLLOWUP_KEY)}
              className="mb-4 flex w-full items-center justify-between gap-3 rounded-card border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-right text-[13.5px] font-semibold text-amber-700 transition hover:bg-amber-500/15"
            >
              <span>
                ⏰ {toPersianDigits(leads.filter(needsFollowup).length)} کسب‌وکار «قبول برای دیدن» رو زدن و هنوز پیگیری نشدن
              </span>
              <span className="text-[12px] underline underline-offset-4">نمایش</span>
            </button>
          )}

          <div className="mb-4 flex flex-wrap gap-2">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter((prev) => (prev === tab.key ? "all" : tab.key))}
                className={`whitespace-nowrap rounded-full border px-4 py-2 text-[12.5px] font-bold transition ${
                  statusFilter === tab.key
                    ? tab.activeClass
                    : "border-ink/[0.18] text-dim hover:border-accent hover:text-accent"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            <select
              value={businessTypeFilter}
              onChange={(e) => setBusinessTypeFilter(e.target.value)}
              className="rounded-full border border-ink/[0.18] bg-canvas px-4 py-1.5 text-[12.5px] font-bold text-dim outline-none transition hover:border-accent hover:text-accent focus:border-accent"
            >
              <option value="">همه‌ی دسته‌های کسب‌وکار</option>
              <BusinessTypeOptions extra={leads.map((l) => l.business_type)} />
            </select>
            <select
              value={problemStatusFilter}
              onChange={(e) => setProblemStatusFilter(e.target.value)}
              className="rounded-full border border-ink/[0.18] bg-canvas px-4 py-1.5 text-[12.5px] font-bold text-dim outline-none transition hover:border-accent hover:text-accent focus:border-accent"
            >
              <option value="">همه‌ی وضعیت‌های مشکل</option>
              {CRM_PROBLEM_STATUS_OPTIONS.map((o) => (
                <option key={o.label} value={o.label}>
                  {o.label}
                </option>
              ))}
            </select>
            {(businessTypeFilter || problemStatusFilter) && (
              <button
                type="button"
                onClick={() => {
                  setBusinessTypeFilter("");
                  setProblemStatusFilter("");
                }}
                className="rounded-full border border-ink/[0.18] px-4 py-1.5 text-[12.5px] font-bold text-dim transition hover:border-accent hover:text-accent"
              >
                پاک کردن فیلتر
              </button>
            )}
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
              <div className="flex flex-col gap-3 xl:hidden">
                {paged.map((l) => (
                  <div key={l.id} className="rounded-card border border-ink/[0.14] bg-surface/20 p-4">
                    <div className="min-w-0">
                      <p className="font-semibold text-[14.5px]">{l.name}</p>
                      <PhoneLinks lead={l} className="mt-1" />
                      {l.business_area && <p className="mt-1 text-[12.5px] text-dim">{l.business_area}</p>}
                      <LeadChips lead={l} />
                      <LeadExtras lead={l} />
                    </div>
                    {editingId === l.id ? (
                      <div className="mt-3 border-t border-ink/10 pt-3">
                        <EditLeadFields lead={l} onDone={() => setEditingId(null)} />
                      </div>
                    ) : (
                      <>
                        {(l.business_type || l.problem_status) && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {l.business_type && (
                              <span className="rounded-full border border-ink/[0.16] bg-surface/40 px-2.5 py-1 text-[11.5px] font-semibold text-dim">
                                {l.business_type}
                              </span>
                            )}
                            {l.problem_status && (
                              <span className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-[11.5px] font-bold leading-none ${getCrmProblemStatusColorClass(l.problem_status)}`}>
                                {l.problem_status}
                              </span>
                            )}
                          </div>
                        )}
                        {showCreator && (
                          <p className="mt-2 font-mono text-[11.5px] text-dim/70">ثبت‌کننده: {creatorLabel(l.created_by)}</p>
                        )}
                        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-ink/10 pt-3">
                          <CallStatusCell lead={l} />
                          {canEdit && (
                            <button
                              type="button"
                              onClick={() => setEditingId(l.id)}
                              className="rounded-full border border-ink/[0.18] px-3 py-1.5 text-[12px] font-semibold text-dim transition hover:border-accent hover:text-accent"
                            >
                              ویرایش
                            </button>
                          )}
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
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Table — wide desktop only (xl+). Between lg and xl the dashboard
                  sidebar eats ~280px, which left the status columns too narrow
                  and made their pills wrap/split — cards fit that width better. */}
              <div className="hidden overflow-x-auto rounded-card border border-ink/[0.14] xl:block">
                <table className="w-full min-w-[960px] border-collapse text-right text-[14px]">
                  <thead>
                    <tr className="bg-navy text-alabaster">
                      <th className="whitespace-nowrap px-4 py-3.5 font-semibold">نام</th>
                      <th className="whitespace-nowrap px-4 py-3.5 font-semibold">شماره</th>
                      <th className="whitespace-nowrap px-4 py-3.5 font-semibold">منطقه</th>
                      <th className="whitespace-nowrap px-4 py-3.5 font-semibold">نوع کسب‌وکار</th>
                      <th className="whitespace-nowrap px-4 py-3.5 font-semibold">وضعیت مشکل</th>
                      <th className="whitespace-nowrap px-4 py-3.5 font-semibold">وضعیت تماس</th>
                      {showCreator && <th className="whitespace-nowrap px-4 py-3.5 font-semibold">ثبت‌کننده</th>}
                      {canEdit && <th className="whitespace-nowrap px-4 py-3.5 font-semibold"></th>}
                      {canDelete && <th className="whitespace-nowrap px-4 py-3.5 font-semibold"></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((l, i) => (
                      <tr key={l.id} className={i % 2 === 0 ? "bg-surface/20" : "bg-canvas"}>
                        <td className="min-w-[15rem] px-4 py-3.5 font-semibold">
                          {l.name}
                          <LeadChips lead={l} />
                          <LeadExtras lead={l} />
                        </td>
                        <td className="px-4 py-3.5">
                          <PhoneLinks lead={l} />
                        </td>
                        {editingId === l.id ? (
                          <td className="px-4 py-3.5" colSpan={3}>
                            <EditLeadFields lead={l} onDone={() => setEditingId(null)} />
                          </td>
                        ) : (
                          <>
                            <td className="min-w-[9rem] px-4 py-3.5 text-dim">{l.business_area || "—"}</td>
                            <td className="whitespace-nowrap px-4 py-3.5 text-dim">{l.business_type || "—"}</td>
                            <td className="whitespace-nowrap px-4 py-3.5">
                              {l.problem_status ? (
                                <span className={`inline-block whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[12px] font-bold leading-none ${getCrmProblemStatusColorClass(l.problem_status)}`}>
                                  {l.problem_status}
                                </span>
                              ) : (
                                <span className="text-dim">—</span>
                              )}
                            </td>
                          </>
                        )}
                        <td className="whitespace-nowrap px-4 py-3.5">
                          <CallStatusCell lead={l} />
                        </td>
                        {showCreator && (
                          <td className="px-4 py-3.5 font-mono text-[12.5px] text-dim">{creatorLabel(l.created_by)}</td>
                        )}
                        {canEdit && (
                          <td className="px-4 py-3.5">
                            {editingId !== l.id && (
                              <button
                                type="button"
                                onClick={() => setEditingId(l.id)}
                                className="rounded-full border border-ink/[0.18] px-3 py-1.5 text-[12px] font-semibold text-dim transition hover:border-accent hover:text-accent"
                              >
                                ویرایش
                              </button>
                            )}
                          </td>
                        )}
                        {canDelete && (
                          <td className="px-4 py-3.5">
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
