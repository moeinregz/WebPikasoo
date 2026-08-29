"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createCrmLeadAction, toggleCrmCalledAction, deleteCrmLeadAction, type CrmFormState } from "./actions";
import { toPersianDigits } from "@/lib/auth";

type Lead = {
  id: number;
  name: string;
  phone: string;
  note: string;
  called: number;
  created_at: string;
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
  return (
    <form action={formAction} className="mb-6 rounded-card border border-ink/[0.14] bg-surface/20 p-6">
      <h2 className="mb-4 font-display text-lg font-normal">افزودن شماره‌ی جدید به CRM</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        <input name="name" required placeholder="نام / نام کسب‌وکار" className={inputClass} />
        <input name="phone" required dir="ltr" placeholder="شماره تماس" className={inputClass} />
        <input name="note" placeholder="یادداشت (اختیاری)" className={inputClass} />
      </div>
      {state && <p className={`mt-3 text-sm ${state.ok ? "text-accent" : "text-dim"}`}>{state.message}</p>}
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

export default function CrmPanel({ leads }: { leads: Lead[] }) {
  const calledCount = leads.filter((l) => l.called).length;

  return (
    <div>
      <AddLeadForm />

      {leads.length === 0 ? (
        <div className="rounded-card border border-dashed border-ink/[0.2] p-14 text-center text-dim">
          هنوز شماره‌ای تو CRM ثبت نشده.
        </div>
      ) : (
        <>
          <p className="mb-4 font-mono text-[12.5px] text-dim">
            {toPersianDigits(calledCount)} از {toPersianDigits(leads.length)} تماس گرفته شده
          </p>
          <div className="overflow-x-auto rounded-card border border-ink/[0.14]">
            <table className="w-full min-w-[560px] border-collapse text-right text-[14px]">
              <thead>
                <tr className="bg-navy text-alabaster">
                  <th className="px-5 py-3.5 font-semibold">نام</th>
                  <th className="px-5 py-3.5 font-semibold">شماره</th>
                  <th className="px-5 py-3.5 font-semibold">یادداشت</th>
                  <th className="px-5 py-3.5 font-semibold">وضعیت تماس</th>
                  <th className="px-5 py-3.5 font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l, i) => (
                  <tr key={l.id} className={i % 2 === 0 ? "bg-surface/20" : "bg-canvas"}>
                    <td className="px-5 py-3.5 font-semibold">{l.name}</td>
                    <td className="px-5 py-3.5 font-mono" dir="ltr">
                      <a href={`tel:${l.phone}`} className="hover:text-accent">
                        {toPersianDigits(l.phone)}
                      </a>
                    </td>
                    <td className="px-5 py-3.5 text-dim">{l.note || "—"}</td>
                    <td className="px-5 py-3.5">
                      <form action={toggleCrmCalledAction}>
                        <input type="hidden" name="leadId" value={l.id} />
                        <input type="hidden" name="called" value={l.called ? "0" : "1"} />
                        <CalledToggle id={l.id} called={l.called} />
                      </form>
                    </td>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
