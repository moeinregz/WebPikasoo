"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { markInquiryFollowedUpAction, deleteInquiryAction } from "./actions";
import { formatDateTime } from "./format";
import SearchInput from "./SearchInput";
import type { Inquiry } from "@/lib/db";

export default function OrdersPanel({ inquiries, isAdmin }: { inquiries: Inquiry[]; isAdmin: boolean }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return inquiries;
    return inquiries.filter((inq) =>
      [inq.name, inq.email, inq.phone, inq.message, inq.project_type, inq.budget]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(q))
    );
  }, [inquiries, query]);

  if (inquiries.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-ink/[0.2] p-8 sm:p-14 text-center text-dim">
        به‌محض این‌که کسی فرم تماس رو پر کنه، همین‌جا نشونش می‌دیم.
      </div>
    );
  }

  return (
    <div>
      <SearchInput value={query} onChange={setQuery} placeholder="جستجو بر اساس نام، ایمیل، شماره یا متن پیام..." />

      {filtered.length === 0 ? (
        <div className="rounded-card border border-dashed border-ink/[0.2] p-6 sm:p-10 text-center text-dim">
          نتیجه‌ای برای این جستجو پیدا نشد.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((inq) => (
            <article
              key={inq.id}
              className={`rounded-card border p-6 ${
                inq.status === "followed_up"
                  ? "border-emerald-500/25 bg-emerald-500/[0.04]"
                  : "border-ink/[0.14] bg-surface/20"
              }`}
            >
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-xl font-normal">{inq.name}</h2>
                    <span
                      className={`rounded-md border px-2.5 py-0.5 font-mono text-[11px] ${
                        inq.status === "followed_up"
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
                          : "border-accent/30 bg-accent/10 text-accent"
                      }`}
                    >
                      {inq.status === "followed_up" ? "پیگیری شد" : "جدید"}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[12.5px] text-dim">
                    {inq.email && (
                      <Link
                        href={`mailto:${inq.email}`}
                        className="underline decoration-dim/40 underline-offset-4 hover:text-accent"
                        dir="ltr"
                      >
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
                    {!inq.email && !inq.phone && <span>راه ارتباطی ثبت نشده</span>}
                  </div>
                </div>
                <span className="whitespace-nowrap font-mono text-xs text-dim/70">
                  {formatDateTime(inq.created_at)}
                </span>
              </div>

              <div className="mb-4 flex flex-wrap gap-2">
                {inq.project_type && (
                  <span className="rounded-md border border-accent/30 bg-accent/10 px-3 py-1 font-mono text-xs text-accent">
                    {inq.project_type}
                  </span>
                )}
                {inq.budget && (
                  <span className="rounded-md border border-ink/[0.2] px-3 py-1 font-mono text-xs text-dim">
                    بودجه: {inq.budget}
                  </span>
                )}
              </div>

              <p className="whitespace-pre-wrap text-[14.5px] leading-relaxed text-ink/90">{inq.message}</p>

              {isAdmin && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <form action={markInquiryFollowedUpAction}>
                    <input type="hidden" name="inquiryId" value={inq.id} />
                    <input
                      type="hidden"
                      name="status"
                      value={inq.status === "followed_up" ? "new" : "followed_up"}
                    />
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
                  <form action={deleteInquiryAction}>
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
          ))}
        </div>
      )}
    </div>
  );
}
