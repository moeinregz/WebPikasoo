"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import {
  markInquiryFollowedUpAction,
  deleteInquiryAction,
  createManualOrderAction,
  updateManualOrderAction,
  type ManualOrderFormState,
} from "./actions";
import { formatDateTime } from "./format";
import SearchInput from "./SearchInput";
import type { Inquiry } from "@/lib/db";

const inputClass =
  "w-full rounded-[10px] border border-ink/[0.16] bg-surface/40 px-3.5 py-2.5 text-[14px] text-ink placeholder:text-dim/60 outline-none transition focus:border-accent focus:bg-surface/70";
const labelClass = "mb-1 block text-[12px] font-semibold text-dim";

const CHANNELS = ["تماس تلفنی", "واتساپ", "اینستاگرام", "تلگرام", "حضوری", "معرفی دوستان", "سایر"];
const PAYMENT_LABEL: Record<string, string> = {
  unpaid: "پرداخت‌نشده",
  deposit: "بیعانه پرداخت شده",
  paid: "تسویه‌شده",
};
const PAYMENT_STYLE: Record<string, string> = {
  unpaid: "border-ink/[0.2] text-dim",
  deposit: "border-amber-500/40 bg-amber-500/10 text-amber-600",
  paid: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600",
};

type Filter = "all" | "site" | "manual";
const isManual = (i: Inquiry) => i.source === "manual";

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-accent px-6 py-2.5 text-[14px] font-semibold text-black transition hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}

function Field({ label, required, children, wide }: { label: string; required?: boolean; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={wide ? "sm:col-span-2 lg:col-span-3" : ""}>
      <label className={labelClass}>
        {label}
        {required && <span className="text-accent"> *</span>}
      </label>
      {children}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <p className="mb-2.5 border-b border-ink/[0.1] pb-1.5 text-[13px] font-bold text-accent">{title}</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </div>
  );
}

/** Register (or edit) an order taken outside the site — every detail of it.
 *  The server stores it against the signed-in staff member, so only they (and
 *  admins) ever see it. */
function ManualOrderForm({ order, onDone }: { order?: Inquiry; onDone: () => void }) {
  const editing = !!order;
  const [state, formAction] = useFormState<ManualOrderFormState, FormData>(
    editing ? updateManualOrderAction : createManualOrderAction,
    null
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      const t = setTimeout(onDone, 700);
      return () => clearTimeout(t);
    }
  }, [state, onDone]);

  return (
    <form ref={formRef} action={formAction} className="rounded-card border border-accent/30 bg-surface/20 p-5 sm:p-6">
      {order && <input type="hidden" name="inquiryId" value={order.id} />}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-normal">{editing ? "ویرایش سفارش" : "ثبت سفارش جدید (خارج از سایت)"}</h2>
          <p className="mt-1 text-[12.5px] leading-relaxed text-dim">
            {editing
              ? "تغییرات همین‌جا ذخیره می‌شه."
              : "این سفارش فقط برای خودتون (و مدیر) نمایش داده می‌شه؛ هیچ کارشناس دیگه‌ای اون رو نمی‌بینه."}
          </p>
        </div>
        <button type="button" onClick={onDone} className="text-sm text-dim transition hover:text-ink">
          ✕
        </button>
      </div>

      <Section title="مشخصات مشتری">
        <Field label="نام و نام خانوادگی" required>
          <input name="name" required defaultValue={order?.name} placeholder="مثلاً علی رضایی" className={inputClass} />
        </Field>
        <Field label="نام کسب‌وکار">
          <input name="businessName" defaultValue={order?.business_name} placeholder="نام فروشگاه، کافه، کلینیک..." className={inputClass} />
        </Field>
        <Field label="شماره‌ی تماس" required>
          <input name="phone" required dir="ltr" defaultValue={order?.phone ?? ""} placeholder="09123456789" className={inputClass} />
        </Field>
        <Field label="شماره‌ی دوم">
          <input name="phone2" dir="ltr" defaultValue={order?.phone2} placeholder="اختیاری" className={inputClass} />
        </Field>
        <Field label="ایمیل">
          <input name="email" type="email" dir="ltr" defaultValue={order?.email} placeholder="اختیاری" className={inputClass} />
        </Field>
        <Field label="شهر">
          <input name="city" defaultValue={order?.city} placeholder="مثلاً تهران" className={inputClass} />
        </Field>
        <Field label="اینستاگرام">
          <input name="instagram" dir="ltr" defaultValue={order?.instagram} placeholder="@page_name" className={inputClass} />
        </Field>
      </Section>

      <Section title="جزئیات سفارش">
        <Field label="نحوه‌ی دریافت سفارش">
          <select name="channel" defaultValue={order?.channel ?? ""} className={inputClass}>
            <option value="">انتخاب کنید</option>
            {CHANNELS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
        <Field label="نوع پروژه / خدمت">
          <input name="projectType" defaultValue={order?.project_type ?? ""} placeholder="مثلاً سایت فروشگاهی، سایت شرکتی" className={inputClass} />
        </Field>
        <Field label="موعد تحویل">
          <input name="deliveryDate" defaultValue={order?.delivery_date} placeholder="مثلاً ۱۴۰۵/۰۹/۱۵" className={inputClass} />
        </Field>
        <Field label="شرح سفارش" required wide>
          <textarea
            name="message"
            required
            rows={4}
            defaultValue={order?.message}
            placeholder="هر چیزی که مشتری خواسته: بخش‌ها، قالب، امکانات، نکته‌های خاص..."
            className={`${inputClass} resize-y leading-relaxed`}
          />
        </Field>
      </Section>

      <Section title="مالی">
        <Field label="مبلغ توافقی">
          <input name="agreedPrice" defaultValue={order?.agreed_price} placeholder="مثلاً ۱۵,۰۰۰,۰۰۰ تومان" className={inputClass} />
        </Field>
        <Field label="بیعانه‌ی دریافتی">
          <input name="deposit" defaultValue={order?.deposit} placeholder="مثلاً ۵,۰۰۰,۰۰۰ تومان" className={inputClass} />
        </Field>
        <Field label="وضعیت پرداخت">
          <select name="paymentStatus" defaultValue={order?.payment_status ?? "unpaid"} className={inputClass}>
            <option value="unpaid">پرداخت‌نشده</option>
            <option value="deposit">بیعانه پرداخت شده</option>
            <option value="paid">تسویه‌شده</option>
          </select>
        </Field>
      </Section>

      <Section title="یادداشت داخلی">
        <Field label="یادداشت (فقط برای خودتون)" wide>
          <textarea name="notes" rows={2} defaultValue={order?.notes} placeholder="قرارها، نکته‌ها، پیگیری‌ها..." className={`${inputClass} resize-y leading-relaxed`} />
        </Field>
      </Section>

      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton label={editing ? "ذخیره‌ی تغییرات" : "ثبت سفارش"} pendingLabel="در حال ذخیره..." />
        <button
          type="button"
          onClick={onDone}
          className="rounded-full border border-ink/[0.18] px-5 py-2.5 text-[13.5px] font-semibold text-dim transition hover:border-accent hover:text-accent"
        >
          انصراف
        </button>
        {state && (
          <p className={`text-[13px] font-semibold ${state.ok ? "text-emerald-600" : "text-red-500"}`} role="status">
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}

function Info({ label, value, ltr }: { label: string; value?: string | null; ltr?: boolean }) {
  if (!value) return null;
  return (
    <div className="min-w-0">
      <p className="text-[11.5px] text-dim/80">{label}</p>
      <p className="break-words text-[13.5px] font-semibold text-ink/90" dir={ltr ? "ltr" : undefined} style={ltr ? { textAlign: "right" } : undefined}>
        {value}
      </p>
    </div>
  );
}

export default function OrdersPanel({
  inquiries,
  isAdmin,
  currentUserId,
  canCreate,
  staffNames,
}: {
  inquiries: Inquiry[];
  isAdmin: boolean;
  currentUserId: number;
  canCreate: boolean;
  staffNames: Record<number, string>;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const counts = useMemo(
    () => ({ all: inquiries.length, manual: inquiries.filter(isManual).length, site: inquiries.filter((i) => !isManual(i)).length }),
    [inquiries]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return inquiries.filter((inq) => {
      if (filter === "manual" && !isManual(inq)) return false;
      if (filter === "site" && isManual(inq)) return false;
      if (!q) return true;
      return [
        inq.name, inq.email, inq.phone, inq.message, inq.project_type, inq.budget,
        inq.business_name, inq.phone2, inq.city, inq.instagram, inq.channel, inq.agreed_price, inq.notes,
      ]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(q));
    });
  }, [inquiries, query, filter]);

  const fa = (n: number) => n.toLocaleString("fa-IR");

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["all", "همه", counts.all],
              ["site", "فرم سایت", counts.site],
              ["manual", "ثبت دستی", counts.manual],
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
        {canCreate && !creating && (
          <button
            type="button"
            onClick={() => {
              setCreating(true);
              setEditingId(null);
            }}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-[13.5px] font-bold text-black transition hover:-translate-y-0.5"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} className="h-4 w-4">
              <path d="M12 5v14M5 12h14" />
            </svg>
            ثبت سفارش جدید
          </button>
        )}
      </div>

      {creating && (
        <div className="mb-6">
          <ManualOrderForm onDone={() => setCreating(false)} />
        </div>
      )}

      {inquiries.length === 0 ? (
        <div className="rounded-card border border-dashed border-ink/[0.2] p-8 sm:p-14 text-center text-dim">
          هنوز سفارشی نیست. به‌محض این‌که کسی فرم تماس رو پر کنه، یا شما یه سفارش ثبت کنید، همین‌جا نشونش می‌دیم.
        </div>
      ) : (
        <>
          <SearchInput value={query} onChange={setQuery} placeholder="جستجو بر اساس نام، شماره، کسب‌وکار، شهر یا متن سفارش..." />

          {filtered.length === 0 ? (
            <div className="rounded-card border border-dashed border-ink/[0.2] p-6 sm:p-10 text-center text-dim">
              نتیجه‌ای برای این جستجو پیدا نشد.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {filtered.map((inq) => {
                const manual = isManual(inq);
                const canManage = isAdmin || (manual && inq.created_by === currentUserId);
                if (editingId === inq.id && manual) {
                  return <ManualOrderForm key={inq.id} order={inq} onDone={() => setEditingId(null)} />;
                }
                return (
                  <article
                    key={inq.id}
                    className={`rounded-card border p-6 ${
                      inq.status === "followed_up" ? "border-emerald-500/25 bg-emerald-500/[0.04]" : "border-ink/[0.14] bg-surface/20"
                    }`}
                  >
                    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="font-display text-xl font-normal">{inq.name}</h2>
                          {inq.business_name && <span className="text-[13px] text-dim">· {inq.business_name}</span>}
                          <span
                            className={`rounded-md border px-2.5 py-0.5 font-mono text-[11px] ${
                              inq.status === "followed_up"
                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
                                : "border-accent/30 bg-accent/10 text-accent"
                            }`}
                          >
                            {inq.status === "followed_up" ? "پیگیری شد" : "جدید"}
                          </span>
                          {manual && (
                            <span className="rounded-md border border-violet-500/30 bg-violet-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-violet-500">
                              ثبت دستی
                            </span>
                          )}
                          {manual && inq.payment_status && (
                            <span className={`rounded-md border px-2.5 py-0.5 text-[11px] font-semibold ${PAYMENT_STYLE[inq.payment_status]}`}>
                              {PAYMENT_LABEL[inq.payment_status]}
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[12.5px] text-dim">
                          {inq.email && (
                            <Link href={`mailto:${inq.email}`} className="underline decoration-dim/40 underline-offset-4 hover:text-accent" dir="ltr">
                              {inq.email}
                            </Link>
                          )}
                          {inq.phone && (
                            <>
                              {inq.email && <span aria-hidden="true">·</span>}
                              <Link href={`tel:${inq.phone}`} className="hover:text-accent" dir="ltr">
                                {inq.phone}
                              </Link>
                            </>
                          )}
                          {inq.phone2 && (
                            <>
                              <span aria-hidden="true">·</span>
                              <Link href={`tel:${inq.phone2}`} className="hover:text-accent" dir="ltr">
                                {inq.phone2}
                              </Link>
                            </>
                          )}
                          {!inq.email && !inq.phone && <span>راه ارتباطی ثبت نشده</span>}
                        </div>
                      </div>
                      <div className="text-left">
                        <span className="whitespace-nowrap font-mono text-xs text-dim/70">{formatDateTime(inq.created_at)}</span>
                        {isAdmin && manual && inq.created_by != null && (
                          <p className="mt-1 text-[11.5px] text-dim">ثبت‌شده توسط {staffNames[inq.created_by] ?? "کارشناس"}</p>
                        )}
                      </div>
                    </div>

                    <div className="mb-4 flex flex-wrap gap-2">
                      {inq.project_type && (
                        <span className="rounded-md border border-accent/30 bg-accent/10 px-3 py-1 font-mono text-xs text-accent">{inq.project_type}</span>
                      )}
                      {inq.budget && (
                        <span className="rounded-md border border-ink/[0.2] px-3 py-1 font-mono text-xs text-dim">بودجه: {inq.budget}</span>
                      )}
                    </div>

                    {manual && (
                      <div className="mb-4 grid gap-x-5 gap-y-3 rounded-lg border border-ink/[0.1] bg-canvas/40 p-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Info label="شهر" value={inq.city} />
                        <Info label="اینستاگرام" value={inq.instagram} ltr />
                        <Info label="نحوه‌ی دریافت سفارش" value={inq.channel} />
                        <Info label="موعد تحویل" value={inq.delivery_date} />
                        <Info label="مبلغ توافقی" value={inq.agreed_price} />
                        <Info label="بیعانه" value={inq.deposit} />
                      </div>
                    )}

                    <p className="whitespace-pre-wrap text-[14.5px] leading-relaxed text-ink/90">{inq.message}</p>

                    {manual && inq.notes && (
                      <div className="mt-4 rounded-lg border border-amber-500/25 bg-amber-500/[0.06] p-3.5">
                        <p className="mb-1 text-[11.5px] font-bold text-amber-600">یادداشت داخلی</p>
                        <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-ink/85">{inq.notes}</p>
                      </div>
                    )}

                    {canManage && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        <form action={markInquiryFollowedUpAction}>
                          <input type="hidden" name="inquiryId" value={inq.id} />
                          <input type="hidden" name="status" value={inq.status === "followed_up" ? "new" : "followed_up"} />
                          <button
                            type="submit"
                            className={`rounded-full border px-4 py-1.5 text-[12.5px] font-bold transition ${
                              inq.status === "followed_up"
                                ? "border-ink/[0.2] text-dim hover:border-accent hover:text-accent"
                                : "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                            }`}
                          >
                            {inq.status === "followed_up" ? "برگردوندن به جدید" : "پیگیری شد ✓"}
                          </button>
                        </form>
                        {manual && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(inq.id);
                              setCreating(false);
                            }}
                            className="rounded-full border border-ink/[0.2] px-4 py-1.5 text-[12.5px] font-semibold text-dim transition hover:border-accent hover:text-accent"
                          >
                            ویرایش
                          </button>
                        )}
                        <form
                          action={deleteInquiryAction}
                          onSubmit={(e) => {
                            if (!confirm("این سفارش برای همیشه حذف بشه؟")) e.preventDefault();
                          }}
                        >
                          <input type="hidden" name="inquiryId" value={inq.id} />
                          <button
                            type="submit"
                            className="rounded-full border border-red-500/30 px-4 py-1.5 text-[12.5px] font-semibold text-red-500/90 transition hover:bg-red-500/10"
                          >
                            حذف
                          </button>
                        </form>
                      </div>
                    )}
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
