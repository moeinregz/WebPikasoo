"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createPrivateSiteAction, deletePrivateSiteAction, type PrivateSiteFormState } from "./actions";
import { formatDate } from "./format";

type PrivateSite = {
  id: number;
  token: string;
  name: string;
  note: string;
  created_at: string;
};

const inputClass =
  "w-full rounded-[10px] border border-ink/[0.16] bg-surface/40 px-4 py-3 text-[14.5px] text-ink placeholder:text-dim/60 outline-none transition focus:border-accent focus:bg-surface/70";

const fileInputClass =
  "block w-full text-[13.5px] text-dim file:ml-3 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-2 file:text-[12.5px] file:font-bold file:text-canvas";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-1 rounded-full bg-accent px-6 py-3 text-[14.5px] font-semibold text-black transition hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60"
    >
      {pending ? "در حال آپلود..." : "آپلود و ساخت لینک"}
    </button>
  );
}

function DeleteButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (!confirm("این سایت و لینکش حذف بشه؟ کسی که لینک رو داره دیگه نمی‌تونه ببینتش.")) e.preventDefault();
      }}
      className="whitespace-nowrap rounded-full border border-red-500/30 px-3 py-1.5 text-[12px] font-semibold text-red-500/90 transition hover:bg-red-500/10 disabled:pointer-events-none disabled:opacity-60"
    >
      حذف
    </button>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for browsers/contexts without the async clipboard API.
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }
  return (
    <button
      type="button"
      onClick={copy}
      className="whitespace-nowrap rounded-full border border-ink/[0.18] px-3 py-1.5 text-[12px] font-semibold text-dim transition hover:border-accent hover:text-accent"
    >
      {copied ? "کپی شد ✓" : "کپی لینک"}
    </button>
  );
}

function fullLink(path: string) {
  if (typeof window === "undefined") return path;
  return `${window.location.origin}${path}`;
}

const initialState: PrivateSiteFormState = null;

function UploadForm() {
  const [state, formAction] = useFormState(createPrivateSiteAction, initialState);
  const [open, setOpen] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Only clear the form once the upload actually succeeded, so an error
  // (wrong file type, too big...) doesn't wipe what was typed.
  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      setFileName(null);
    }
  }, [state]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mb-6 inline-flex items-center gap-2 rounded-full border-2 border-ink/70 px-5 py-2.5 text-[13.5px] font-bold text-ink transition hover:bg-ink hover:text-canvas"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
          <path d="M12 5v14M5 12h14" />
        </svg>
        آپلود سایت جدید
      </button>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="mb-6 rounded-card border border-ink/[0.14] bg-surface/20 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-normal">آپلود سایت خصوصی</h2>
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-dim transition hover:text-ink">
          بستن
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <input name="name" required placeholder="اسم سایت (مثلاً: دمو دندانپزشکی دکتر ...)" className={inputClass} />
        <input name="note" placeholder="یادداشت برای خودت (اختیاری)" className={inputClass} />
        <div className="sm:col-span-2 rounded-lg border border-ink/[0.12] bg-surface/30 p-4">
          <label className="mb-1.5 block text-[12.5px] font-semibold text-dim">فایل HTML سایت</label>
          <p className="mb-3 text-[12px] text-dim/80">
            این سایت توی نمونه‌کارها و صفحه‌ی اصلی نمایش داده نمی‌شه — فقط یه لینک مخصوص می‌گیری که برای هر کسی
            بفرستی می‌تونه ببینه.
          </p>
          <input
            type="file"
            name="siteFile"
            required
            accept=".html,.htm,text/html"
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
            className={fileInputClass}
          />
          {fileName && (
            <p className="mt-2 truncate text-[12.5px] text-accent" dir="ltr">
              {fileName}
            </p>
          )}
        </div>
      </div>

      {state && !state.ok && <p className="mt-3 text-sm text-red-500">{state.message}</p>}
      {state?.ok && state.link && (
        <div className="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3">
          <p className="mb-2 text-[13px] font-semibold text-emerald-600">{state.message}</p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="min-w-0 flex-1 truncate font-mono text-[12.5px] text-ink" dir="ltr">
              {fullLink(state.link)}
            </span>
            <CopyButton text={fullLink(state.link)} />
          </div>
        </div>
      )}
      <SubmitButton />
    </form>
  );
}

export default function PrivateSitesPanel({ sites }: { sites: PrivateSite[] }) {
  return (
    <div>
      <UploadForm />

      {sites.length === 0 ? (
        <div className="rounded-card border border-dashed border-ink/[0.2] p-8 sm:p-14 text-center text-dim">
          هنوز سایتی آپلود نشده — از دکمه‌ی بالا یه فایل HTML آپلود کن تا لینکش ساخته بشه.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sites.map((s) => {
            const path = `/preview/${s.token}`;
            return (
              <div key={s.id} className="rounded-card border border-ink/[0.14] bg-surface/20 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[14.5px] font-semibold">{s.name}</p>
                    {s.note && <p className="mt-1 text-[12.5px] text-dim">{s.note}</p>}
                    <p className="mt-1.5 font-mono text-[11.5px] text-dim/70">{formatDate(s.created_at)}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <CopyButton text={fullLink(path)} />
                    <a
                      href={path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="whitespace-nowrap rounded-full border border-ink/[0.18] px-3 py-1.5 text-[12px] font-semibold text-dim transition hover:border-accent hover:text-accent"
                    >
                      مشاهده
                    </a>
                    <form action={deletePrivateSiteAction}>
                      <input type="hidden" name="siteId" value={s.id} />
                      <DeleteButton />
                    </form>
                  </div>
                </div>
                <p className="mt-3 truncate rounded-md bg-canvas/60 px-3 py-2 font-mono text-[12px] text-dim" dir="ltr">
                  {path}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
