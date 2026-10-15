"use client";

import { useEffect, useRef, useState, type DragEvent } from "react";
import { useFormState, useFormStatus } from "react-dom";
import {
  createPrivateSiteAction,
  deletePrivateSiteAction,
  removePrivateSiteImageAction,
  uploadPrivateSiteImageAction,
  type PrivateSiteFormState,
} from "./actions";
import { formatDate } from "./format";

type ImageSlot = { key: string; label: string; hint?: string; ratio: string };

type PrivateSite = {
  id: number;
  token: string;
  name: string;
  note: string;
  created_at: string;
  /** photo spots of the template this site was built from (empty = none) */
  slots: ImageSlot[];
  /** slot key → uploaded photo URL */
  images?: Record<string, string>;
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

const FA = "۰۱۲۳۴۵۶۷۸۹";
const fa = (n: number) => String(n).replace(/[0-9]/g, (d) => FA[Number(d)]);

/** Shrinks a photo in the browser (longest side 2000px, JPEG) so uploads are
 *  quick, fit the server's request limit and the finished site stays light.
 *  Phone photos of 5–10 MB typically end up around 300–600 KB. */
async function shrinkImage(file: File): Promise<{ file: File; width: number }> {
  if (!file.type.startsWith("image/")) throw new Error("فقط فایل عکس قابل قبوله.");

  let width = 0;
  let height = 0;
  let source: CanvasImageSource;
  try {
    const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
    width = bmp.width;
    height = bmp.height;
    source = bmp;
  } catch {
    // Older browsers: decode through an <img>.
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new Image();
        el.onload = () => resolve(el);
        el.onerror = () => reject(new Error("decode"));
        el.src = url;
      });
      width = img.naturalWidth;
      height = img.naturalHeight;
      source = img;
    } catch {
      throw new Error("این عکس باز نشد. فرمت JPG، PNG یا WebP رو امتحان کن (HEIC آیفون رو اول به JPG تبدیل کن).");
    } finally {
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    }
  }
  if (!width || !height) throw new Error("این عکس باز نشد.");

  const toBlob = (c: HTMLCanvasElement, q: number) =>
    new Promise<Blob | null>((resolve) => c.toBlob(resolve, "image/jpeg", q));

  let scale = Math.min(1, 2000 / Math.max(width, height));
  for (let attempt = 0; attempt < 4; attempt++) {
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("مرورگر از پردازش عکس پشتیبانی نمی‌کنه.");
    ctx.fillStyle = "#ffffff"; // PNGs with transparency
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(source, 0, 0, canvas.width, canvas.height);

    for (const q of [0.86, 0.76, 0.66]) {
      const blob = await toBlob(canvas, q);
      if (blob && blob.size <= 2.6 * 1024 * 1024) {
        return { file: new File([blob], "photo.jpg", { type: "image/jpeg" }), width: canvas.width };
      }
    }
    scale *= 0.8;
  }
  throw new Error("نتونستم حجم این عکس رو کم کنم؛ یه عکس دیگه امتحان کن.");
}

function SlotCard({
  slot,
  url,
  busy,
  error,
  onPick,
  onRemove,
}: {
  slot: ImageSlot;
  url?: string;
  busy: boolean;
  error?: string;
  onPick: (file: File) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const ratio = slot.ratio.replace(":", " / ");

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files?.[0];
    if (f && !busy) onPick(f);
  }

  return (
    <div
      className={`rounded-xl border p-3 transition ${
        drag ? "border-accent bg-accent/10" : url ? "border-emerald-500/30 bg-emerald-500/[0.04]" : "border-ink/[0.14] bg-surface/20"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={onDrop}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[13.5px] font-semibold leading-snug">{slot.label}</p>
          {slot.hint && <p className="mt-0.5 text-[11.5px] leading-relaxed text-dim/80">{slot.hint}</p>}
        </div>
        <span className="shrink-0 rounded-full border border-ink/[0.16] px-2 py-0.5 font-mono text-[10.5px] text-dim" dir="ltr">
          {slot.ratio}
        </span>
      </div>

      <button
        type="button"
        onClick={() => !busy && inputRef.current?.click()}
        aria-label={`انتخاب عکس برای ${slot.label}`}
        className="relative flex h-44 w-full items-center justify-center overflow-hidden rounded-lg bg-canvas/60"
      >
        <div
          className={`relative h-full max-w-full overflow-hidden rounded-md ${
            url ? "" : "border-2 border-dashed border-ink/[0.2]"
          }`}
          style={{ aspectRatio: ratio }}
        >
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt={slot.label} className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full flex-col items-center justify-center gap-1.5 px-2 text-center text-[11.5px] text-dim/80">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-6 w-6">
                <rect x="3" y="5" width="18" height="14" rx="2.5" />
                <circle cx="9" cy="10.5" r="1.6" />
                <path d="M4 17l5-4.5 4 3.5 3-2.5 4 3.5" />
              </svg>
              عکس رو بکشید اینجا یا کلیک کنید
            </span>
          )}
        </div>
        {busy && (
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-canvas/80 text-[12px] font-semibold text-ink">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            در حال آپلود...
          </span>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (f) onPick(f);
        }}
      />

      <div className="mt-2.5 flex items-center justify-between gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="rounded-full border border-ink/[0.18] px-3.5 py-1.5 text-[12px] font-semibold text-dim transition hover:border-accent hover:text-accent disabled:pointer-events-none disabled:opacity-50"
        >
          {url ? "تعویض عکس" : "انتخاب عکس"}
        </button>
        {url && (
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              if (confirm(`عکس «${slot.label}» حذف بشه؟ طرح جایگزین قالب برمی‌گرده.`)) onRemove();
            }}
            className="rounded-full border border-red-500/30 px-3 py-1.5 text-[12px] font-semibold text-red-500/90 transition hover:bg-red-500/10 disabled:pointer-events-none disabled:opacity-50"
          >
            حذف
          </button>
        )}
      </div>
      {error && <p className="mt-2 text-[12px] leading-relaxed text-red-500">{error}</p>}
    </div>
  );
}

/** The photo spots of a template-built site: one card per spot, upload by
 *  click or drag & drop, several photos at once fill the empty spots in order.
 *  Photos show up on the same /preview link — nothing to rebuild. */
function SiteImagesEditor({ site }: { site: PrivateSite }) {
  const [images, setImages] = useState<Record<string, string>>(site.images ?? {});
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [note, setNote] = useState<string | null>(null);
  const bulkRef = useRef<HTMLInputElement>(null);

  const filled = site.slots.filter((s) => images[s.key]).length;
  const total = site.slots.length;

  async function uploadTo(slot: ImageSlot, raw: File) {
    setErrors((e) => ({ ...e, [slot.key]: "" }));
    setBusy((b) => ({ ...b, [slot.key]: true }));
    try {
      const { file, width } = await shrinkImage(raw);
      const fd = new FormData();
      fd.set("siteId", String(site.id));
      fd.set("key", slot.key);
      fd.set("image", file);
      const res = await uploadPrivateSiteImageAction(fd);
      if (!res.ok || !res.url) throw new Error(res.message);
      setImages((m) => ({ ...m, [slot.key]: res.url as string }));
      if (width < 900) {
        setErrors((e) => ({ ...e, [slot.key]: "ذخیره شد، ولی عکس کم‌کیفیته (کمتر از ۹۰۰ پیکسل) و روی صفحه‌ی بزرگ تار دیده می‌شه." }));
      }
    } catch (err) {
      setErrors((e) => ({ ...e, [slot.key]: err instanceof Error ? err.message : "آپلود ناموفق بود." }));
    } finally {
      setBusy((b) => ({ ...b, [slot.key]: false }));
    }
  }

  async function removeFrom(slot: ImageSlot) {
    setBusy((b) => ({ ...b, [slot.key]: true }));
    setErrors((e) => ({ ...e, [slot.key]: "" }));
    try {
      const fd = new FormData();
      fd.set("siteId", String(site.id));
      fd.set("key", slot.key);
      const res = await removePrivateSiteImageAction(fd);
      if (!res.ok) throw new Error(res.message);
      setImages((m) => {
        const next = { ...m };
        delete next[slot.key];
        return next;
      });
    } catch (err) {
      setErrors((e) => ({ ...e, [slot.key]: err instanceof Error ? err.message : "حذف ناموفق بود." }));
    } finally {
      setBusy((b) => ({ ...b, [slot.key]: false }));
    }
  }

  async function bulk(files: File[]) {
    const empty = site.slots.filter((s) => !images[s.key]);
    if (empty.length === 0) {
      setNote("همه‌ی جاها پُره؛ برای عوض‌کردن، روی هر کارت «تعویض عکس» بزن.");
      return;
    }
    const used = files.slice(0, empty.length);
    setNote(
      files.length > empty.length
        ? `${fa(used.length)} عکس اول توی جاهای خالی گذاشته شد؛ ${fa(files.length - empty.length)} عکس اضافه نادیده گرفته شد.`
        : `${fa(used.length)} عکس به ترتیب توی جاهای خالی گذاشته می‌شه.`
    );
    // One after another: keeps requests small and the order predictable.
    for (let i = 0; i < used.length; i++) await uploadTo(empty[i], used[i]);
  }

  return (
    <div className="mt-3 rounded-card border border-ink/[0.14] bg-canvas/40 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-[200px] flex-1">
          <p className="text-[13.5px] font-semibold">
            عکس‌های سایت <span className="text-dim">· {fa(filled)} از {fa(total)}</span>
          </p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-ink/[0.1]">
            <div
              className="h-full rounded-full bg-accent transition-all duration-500"
              style={{ width: `${total ? (filled / total) * 100 : 0}%` }}
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => bulkRef.current?.click()}
            className="rounded-full bg-accent px-4 py-2 text-[12.5px] font-semibold text-black transition hover:-translate-y-0.5"
          >
            آپلود چند عکس یکجا
          </button>
          <a
            href={`/preview/${site.token}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-ink/[0.18] px-4 py-2 text-[12.5px] font-semibold text-dim transition hover:border-accent hover:text-accent"
          >
            دیدن سایت
          </a>
        </div>
        <input
          ref={bulkRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            e.target.value = "";
            if (files.length) void bulk(files);
          }}
        />
      </div>

      <p className="mb-3 text-[12px] leading-relaxed text-dim/80">
        عکس‌ها خودکار کم‌حجم می‌شن و از وسط به شکل هر قاب برش می‌خورن (شکل قاب بالای هر کارت پیداست). جای خالی، طرح
        جایگزین قالب رو نشون می‌ده. لینک سایت همون لینک قبلیه — بعد از آپلود فقط صفحه رو رفرش کن.
      </p>
      {note && <p className="mb-3 text-[12px] font-semibold text-accent">{note}</p>}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {site.slots.map((slot) => (
          <SlotCard
            key={slot.key}
            slot={slot}
            url={images[slot.key]}
            busy={!!busy[slot.key]}
            error={errors[slot.key]}
            onPick={(f) => void uploadTo(slot, f)}
            onRemove={() => void removeFrom(slot)}
          />
        ))}
      </div>
    </div>
  );
}

function SiteCard({ site }: { site: PrivateSite }) {
  const path = `/preview/${site.token}`;
  const hasSlots = site.slots.length > 0;
  const filled = site.slots.filter((s) => site.images?.[s.key]).length;
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-card border border-ink/[0.14] bg-surface/20 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[14.5px] font-semibold">{site.name}</p>
          {site.note && <p className="mt-1 text-[12.5px] text-dim">{site.note}</p>}
          <p className="mt-1.5 font-mono text-[11.5px] text-dim/70">{formatDate(site.created_at)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {hasSlots && (
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-[12px] font-semibold transition ${
                filled < site.slots.length
                  ? "border-amber-500/50 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20"
                  : "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
              }`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5">
                <rect x="3" y="5" width="18" height="14" rx="2.5" />
                <circle cx="9" cy="10.5" r="1.6" />
                <path d="M4 17l5-4.5 4 3.5 3-2.5 4 3.5" />
              </svg>
              عکس‌ها ({fa(filled)} از {fa(site.slots.length)})
            </button>
          )}
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
            <input type="hidden" name="siteId" value={site.id} />
            <DeleteButton />
          </form>
        </div>
      </div>
      <p className="mt-3 truncate rounded-md bg-canvas/60 px-3 py-2 font-mono text-[12px] text-dim" dir="ltr">
        {path}
      </p>
      {hasSlots && open && <SiteImagesEditor site={site} />}
    </div>
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
          {sites.map((s) => (
            <SiteCard key={s.id} site={s} />
          ))}
        </div>
      )}
    </div>
  );
}
