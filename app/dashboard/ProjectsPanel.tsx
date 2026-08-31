"use client";

import { useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { createProjectAction, deleteProjectAction, type ProjectFormState } from "./actions";
import { categories } from "@/lib/businessSites";
import { projectViewUrl } from "@/lib/projectLink";

type Project = {
  id: number;
  name: string;
  category: string;
  description: string;
  url: string;
  image: string;
  linkType: "url" | "html";
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
      {pending ? "در حال افزودن..." : "افزودن نمونه‌کار"}
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

const fileInputClass =
  "block w-full text-[13.5px] text-dim file:ml-3 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-2 file:text-[12.5px] file:font-bold file:text-canvas";

function AddProjectForm() {
  const [state, formAction] = useFormState(createProjectAction, initialState);
  const [open, setOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  // Site file / site link are mutually exclusive — picking one clears the
  // other, both so the submitted form is unambiguous and so the UI itself
  // makes that either/or obvious instead of just erroring after submit.
  const [siteFileName, setSiteFileName] = useState<string | null>(null);
  const [siteUrlValue, setSiteUrlValue] = useState("");
  const siteFileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setImagePreview(file ? URL.createObjectURL(file) : null);
  }

  function handleSiteFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setSiteFileName(file ? file.name : null);
    if (file) setSiteUrlValue("");
  }

  function clearSiteFile() {
    setSiteFileName(null);
    if (siteFileRef.current) siteFileRef.current.value = "";
  }

  function handleSiteUrlChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSiteUrlValue(e.target.value);
    if (e.target.value) clearSiteFile();
  }

  function resetForm() {
    formRef.current?.reset();
    setImagePreview(null);
    setSiteFileName(null);
    setSiteUrlValue("");
  }

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
        افزودن نمونه‌کار جدید
      </button>
    );
  }

  return (
    <form
      ref={formRef}
      action={(fd) => {
        formAction(fd);
        resetForm();
      }}
      className="mb-6 rounded-card border border-ink/[0.14] bg-surface/20 p-6"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-normal">افزودن نمونه‌کار جدید</h2>
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-dim transition hover:text-ink">
          بستن
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <input name="name" required placeholder="عنوان (نام پروژه/کسب‌وکار)" className={inputClass} />
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
        <textarea
          name="description"
          rows={3}
          placeholder="توضیحات"
          className={`${inputClass} resize-none sm:col-span-2`}
        />

        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-[12.5px] font-semibold text-dim">
            عکس نمونه‌کار (ترجیحاً WebP)
          </label>
          {imagePreview && (
            <div className="relative mb-2 inline-block h-32 w-full max-w-xs overflow-hidden rounded-lg border border-ink/[0.14]">
              <Image src={imagePreview} alt="" fill unoptimized sizes="320px" className="object-cover" />
            </div>
          )}
          <input type="file" name="image" accept="image/*" onChange={handleImageChange} className={fileInputClass} />
        </div>

        <div className="sm:col-span-2 rounded-lg border border-ink/[0.12] bg-surface/30 p-4">
          <label className="mb-1.5 block text-[12.5px] font-semibold text-dim">فایل سایت</label>
          <p className="mb-3 text-[12px] text-dim/80">
            یا فایل HTML رو آپلود کن (داخل خود سایت باز می‌شه) یا لینک بده (به دامنه‌ی خودش می‌ره) — فقط یکی از این
            دو رو پر کن.
          </p>

          <div className="mb-3">
            {siteFileName ? (
              <div className="mb-2 flex items-center justify-between gap-2 rounded-md border border-accent/25 bg-accent/10 px-3 py-2 text-[12.5px] text-accent">
                <span className="truncate" dir="ltr">
                  {siteFileName}
                </span>
                <button type="button" onClick={clearSiteFile} className="flex-shrink-0 font-bold text-dim hover:text-ink">
                  حذف
                </button>
              </div>
            ) : (
              <input
                ref={siteFileRef}
                type="file"
                name="siteFile"
                accept=".html,.htm,text/html"
                onChange={handleSiteFileChange}
                className={fileInputClass}
              />
            )}
          </div>

          <div className="mb-1.5 flex items-center gap-2 text-[11px] font-mono text-dim/60">
            <span className="h-px flex-1 bg-ink/10" />
            یا
            <span className="h-px flex-1 bg-ink/10" />
          </div>

          <input
            name="siteUrl"
            dir="ltr"
            placeholder="لینک سایت (https://...)"
            value={siteUrlValue}
            onChange={handleSiteUrlChange}
            disabled={!!siteFileName}
            className={`${inputClass} disabled:opacity-50`}
          />
        </div>
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
        <div className="rounded-card border border-dashed border-ink/[0.2] p-8 sm:p-14 text-center text-dim">
          هنوز نمونه‌کاری ثبت نشده — از فرم بالا اولین نمونه‌کار رو اضافه کن.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <article key={p.id} className="group relative overflow-hidden rounded-card border border-ink/[0.14] bg-surface/20">
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#0a0a0c]">
                {p.image ? (
                  <Image
                    src={p.image}
                    alt={p.name}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-mono text-xs text-white/30">
                    بدون تصویر
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="mb-2 flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center rounded-full border border-accent/25 bg-accent/10 px-3 py-1 font-mono text-[11px] font-bold text-accent">
                    {p.category}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-1 font-mono text-[10.5px] font-bold ${
                      p.linkType === "html"
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
                        : "border-ink/[0.16] text-dim"
                    }`}
                  >
                    {p.linkType === "html" ? "فایل HTML" : "لینک خارجی"}
                  </span>
                </div>
                <h4 className="mb-1 font-display text-base font-normal">{p.name}</h4>
                {p.description && <p className="mb-2 text-[13px] text-dim">{p.description}</p>}
                <Link
                  href={projectViewUrl(p)}
                  target="_blank"
                  rel="noopener noreferrer"
                  dir="ltr"
                  className="block truncate text-[12px] text-accent underline"
                >
                  {p.linkType === "html" ? `${projectViewUrl(p)} (روی سایت خودمون)` : p.url}
                </Link>
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
