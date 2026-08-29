"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createProjectAction, deleteProjectAction, type ProjectFormState } from "./actions";
import { categories } from "@/lib/businessSites";

type Project = {
  id: number;
  name: string;
  category: string;
  description: string;
  url: string;
  image: string;
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
      {pending ? "در حال افزودن..." : "افزودن پروژه"}
    </button>
  );
}

function DeleteButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full border border-red-500/40 bg-black/40 px-3 py-1.5 text-[12px] font-semibold text-red-400 backdrop-blur transition hover:bg-red-500/10 disabled:pointer-events-none disabled:opacity-60"
    >
      حذف
    </button>
  );
}

const initialState: ProjectFormState = null;

function AddProjectForm() {
  const [state, formAction] = useFormState(createProjectAction, initialState);
  const [open, setOpen] = useState(false);

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
        افزودن پروژه‌ی جدید
      </button>
    );
  }

  return (
    <form action={formAction} className="mb-6 rounded-card border border-ink/[0.14] bg-surface/20 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-normal">افزودن پروژه‌ی جدید</h2>
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-dim transition hover:text-ink">
          بستن
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <input name="name" required placeholder="نام پروژه/کسب‌وکار" className={inputClass} />
        <select name="category" required defaultValue="" className={inputClass}>
          <option value="" disabled>
            دسته‌بندی رو انتخاب کن
          </option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input name="url" required dir="ltr" placeholder="لینک سایت (https://...)" className={inputClass} />
        <input name="image" dir="ltr" placeholder="لینک عکس/اسکرین‌شات (اختیاری)" className={inputClass} />
        <textarea
          name="description"
          rows={3}
          placeholder="توضیح کوتاه"
          className={`${inputClass} resize-none sm:col-span-2`}
        />
      </div>

      {state && <p className={`mt-3 text-sm ${state.ok ? "text-accent" : "text-dim"}`}>{state.message}</p>}
      <SubmitButton />
    </form>
  );
}

export default function ProjectsPanel({ projects }: { projects: Project[] }) {
  return (
    <div>
      <AddProjectForm />

      {projects.length === 0 ? (
        <div className="rounded-card border border-dashed border-ink/[0.2] p-14 text-center text-dim">
          هنوز پروژه‌ای ثبت نشده — از فرم بالا اولین پروژه رو اضافه کن.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <article key={p.id} className="group relative overflow-hidden rounded-card border border-ink/[0.14] bg-surface/20">
              <div className="aspect-[4/3] w-full overflow-hidden bg-[#0a0a0c]">
                {p.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-mono text-xs text-white/30">
                    بدون تصویر
                  </div>
                )}
              </div>
              <div className="p-4">
                <span className="mb-2 inline-flex items-center rounded-full border border-accent/25 bg-accent/10 px-3 py-1 font-mono text-[11px] font-bold text-accent">
                  {p.category}
                </span>
                <h4 className="mb-1 font-display text-base font-normal">{p.name}</h4>
                {p.description && <p className="mb-2 text-[13px] text-dim">{p.description}</p>}
                <a href={p.url} target="_blank" rel="noopener noreferrer" dir="ltr" className="block truncate text-[12px] text-accent underline">
                  {p.url}
                </a>
              </div>
              <form action={deleteProjectAction} className="absolute left-3 top-3">
                <input type="hidden" name="projectId" value={p.id} />
                <DeleteButton />
              </form>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
