"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ProductDetail, ProductVariantInput } from "@/lib/server/productsRepo";

interface Props {
  mode: "create" | "edit";
  productId?: string;
  initial?: ProductDetail;
  categories: { id: string; label: string }[];
  packagingOptions: { id: string; label: string; priceDelta: number }[];
}

const SALE_TYPE_LABELS = { weight: "وزنی", count: "عددی", box: "جعبه‌ای" } as const;

export function ProductForm({ mode, productId, initial, categories, packagingOptions }: Props) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? categories[0]?.id ?? "");
  const [unitType, setUnitType] = useState<"weight" | "count" | "box">(initial?.unitType ?? "weight");
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [metaTitle, setMetaTitle] = useState(initial?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(initial?.metaDescription ?? "");
  const [variants, setVariants] = useState<ProductVariantInput[]>(
    initial?.variants ?? [{ id: "", saleType: unitType, label: "", price: 0, isAvailable: true }],
  );
  const [packagingIds, setPackagingIds] = useState<string[]>(initial?.packagingIds ?? packagingOptions.map((p) => p.id));
  const [imageUrls, setImageUrls] = useState<string[]>(initial?.imageUrls ?? []);
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = ""; // اجازه انتخاب دوباره همان فایل
    if (files.length === 0) return;

    setUploading(true);
    setUploadError(null);
    try {
      const body = new FormData();
      files.forEach((f) => body.append("files", f));
      const res = await fetch("/api/admin/uploads", {
        method: "POST",
        headers: { "x-requested-with": "karimoglu-web" },
        body,
      });
      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error ?? "آپلود ناموفق بود.");
        return;
      }
      setImageUrls((prev) => [...prev.filter(Boolean), ...(data.urls as string[])]);
    } catch {
      setUploadError("ارتباط با سرور برقرار نشد.");
    } finally {
      setUploading(false);
    }
  }

  function updateVariant(index: number, patch: Partial<ProductVariantInput>) {
    setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setMessage(null);

    const payload = {
      slug,
      name,
      description: description || null,
      categoryId,
      unitType,
      isActive,
      metaTitle: metaTitle || null,
      metaDescription: metaDescription || null,
      variants,
      packagingIds,
      imageUrls: imageUrls.filter(Boolean),
    };

    try {
      const url = mode === "create" ? "/api/admin/products" : `/api/admin/products/${productId}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", "x-requested-with": "karimoglu-web" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "خطا در ذخیره‌سازی.");
        return;
      }
      router.push("/admin/products");
      router.refresh();
    } catch {
      setStatus("error");
      setMessage("ارتباط با سرور برقرار نشد.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <section className="grid grid-cols-1 gap-4 rounded-lg bg-surface p-4 shadow-sm tablet:grid-cols-2">
        <Field label="نام محصول">
          <input value={name} onChange={(e) => setName(e.target.value)} required className="rounded-md border border-border-strong px-3 py-1.5 text-bodySm" />
        </Field>
        <Field label="Slug (آدرس صفحه)">
          <input value={slug} onChange={(e) => setSlug(e.target.value)} required dir="ltr" className="rounded-md border border-border-strong px-3 py-1.5 text-bodySm" />
        </Field>
        <Field label="دسته‌بندی">
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="rounded-md border border-border-strong px-3 py-1.5 text-bodySm">
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="نوع فروش پایه">
          <select value={unitType} onChange={(e) => setUnitType(e.target.value as typeof unitType)} className="rounded-md border border-border-strong px-3 py-1.5 text-bodySm">
            {Object.entries(SALE_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <div className="tablet:col-span-2">
          <Field label="توضیحات">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="rounded-md border border-border-strong px-3 py-1.5 text-bodySm" />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-bodySm text-text-primary">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          فعال (قابل خرید در فروشگاه)
        </label>
      </section>

      <section className="rounded-lg bg-surface p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-h4 text-text-primary">Variantها و قیمت</h2>
          <button
            type="button"
            onClick={() => setVariants((prev) => [...prev, { id: "", saleType: unitType, label: "", price: 0, isAvailable: true }])}
            className="rounded-md border border-border-strong px-3 py-1 text-caption"
          >
            + افزودن Variant
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {variants.map((variant, index) => (
            <div key={index} className="grid grid-cols-2 gap-2 rounded-md border border-border p-3 tablet:grid-cols-5">
              <input
                placeholder="شناسه (مثلاً w-500)"
                value={variant.id}
                onChange={(e) => updateVariant(index, { id: e.target.value })}
                dir="ltr"
                className="rounded-md border border-border-strong px-3 py-1.5 text-bodySm"
              />
              <input
                placeholder="برچسب (مثلاً ۵۰۰ گرم)"
                value={variant.label}
                onChange={(e) => updateVariant(index, { label: e.target.value })}
                className="rounded-md border border-border-strong px-3 py-1.5 text-bodySm"
              />
              <select value={variant.saleType} onChange={(e) => updateVariant(index, { saleType: e.target.value as ProductVariantInput["saleType"] })} className="rounded-md border border-border-strong px-3 py-1.5 text-bodySm">
                {Object.entries(SALE_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="قیمت (تومان)"
                value={variant.price}
                onChange={(e) => updateVariant(index, { price: Number(e.target.value) })}
                className="rounded-md border border-border-strong px-3 py-1.5 text-bodySm"
              />
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1 text-caption">
                  <input type="checkbox" checked={variant.isAvailable} onChange={(e) => updateVariant(index, { isAvailable: e.target.checked })} />
                  موجود
                </label>
                <button
                  type="button"
                  onClick={() => setVariants((prev) => prev.filter((_, i) => i !== index))}
                  className="text-caption text-state-error"
                >
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg bg-surface p-4 shadow-sm">
        <h2 className="mb-3 text-h4 text-text-primary">بسته‌بندی</h2>
        <div className="flex flex-wrap gap-3">
          {packagingOptions.map((p) => (
            <label key={p.id} className="flex items-center gap-2 text-bodySm">
              <input
                type="checkbox"
                checked={packagingIds.includes(p.id)}
                onChange={(e) =>
                  setPackagingIds((prev) => (e.target.checked ? [...prev, p.id] : prev.filter((id) => id !== p.id)))
                }
              />
              {p.label} {p.priceDelta > 0 && `(+${p.priceDelta.toLocaleString("fa-IR")} تومان)`}
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-lg bg-surface p-4 shadow-sm">
        <h2 className="mb-3 text-h4 text-text-primary">تصاویر</h2>

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            onChange={handleFilesSelected}
            className="hidden"
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="rounded-md bg-brand-black px-4 py-1.5 text-bodySm text-white disabled:opacity-50"
          >
            {uploading ? "در حال آپلود..." : "آپلود عکس از فایل‌ها"}
          </button>
          <span className="text-caption text-text-muted">JPG، PNG، WebP یا GIF — حداکثر ۵ مگابایت برای هر عکس</span>
        </div>
        {uploadError && <p className="mb-3 text-caption text-state-error">{uploadError}</p>}

        {imageUrls.filter(Boolean).length > 0 && (
          <div className="mb-4 grid grid-cols-2 gap-3 tablet:grid-cols-4 desktop:grid-cols-6">
            {imageUrls.map(
              (url, index) =>
                url && (
                  <div key={`${url}-${index}`} className="relative overflow-hidden rounded-md border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`تصویر ${index + 1}`} className="aspect-square w-full object-cover" />
                    {index === 0 && (
                      <span className="absolute right-1 top-1 rounded bg-brand-black px-1.5 py-0.5 text-caption text-white">اصلی</span>
                    )}
                    <button
                      type="button"
                      onClick={() => setImageUrls((prev) => prev.filter((_, i) => i !== index))}
                      className="absolute left-1 top-1 rounded bg-white/90 px-1.5 py-0.5 text-caption text-state-error"
                    >
                      حذف
                    </button>
                  </div>
                ),
            )}
          </div>
        )}

        <details>
          <summary className="cursor-pointer text-caption text-text-muted">افزودن تصویر با آدرس URL</summary>
          <div className="mt-2 flex flex-col gap-2">
            {imageUrls.map((url, index) => (
              <div key={index} className="flex gap-2">
                <input
                  value={url}
                  dir="ltr"
                  onChange={(e) => setImageUrls((prev) => prev.map((u, i) => (i === index ? e.target.value : u)))}
                  className="flex-1 rounded-md border border-border-strong px-3 py-1.5 text-bodySm"
                />
                <button type="button" onClick={() => setImageUrls((prev) => prev.filter((_, i) => i !== index))} className="text-caption text-state-error">
                  حذف
                </button>
              </div>
            ))}
            <button type="button" onClick={() => setImageUrls((prev) => [...prev, ""])} className="w-fit rounded-md border border-border-strong px-3 py-1 text-caption">
              + افزودن آدرس
            </button>
          </div>
        </details>
      </section>

      <section className="rounded-lg bg-surface p-4 shadow-sm">
        <h2 className="mb-3 text-h4 text-text-primary">SEO</h2>
        <Field label="عنوان متا (Meta Title)">
          <input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} className="rounded-md border border-border-strong px-3 py-1.5 text-bodySm" />
        </Field>
        <Field label="توضیحات متا (Meta Description)">
          <textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} rows={2} className="rounded-md border border-border-strong px-3 py-1.5 text-bodySm" />
        </Field>
      </section>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={status === "saving" || uploading} className="rounded-md bg-brand-black px-5 py-2 text-bodySm text-white disabled:opacity-50">
          {status === "saving" ? "در حال ذخیره..." : mode === "create" ? "ایجاد محصول" : "ذخیره تغییرات"}
        </button>
        {message && <p className="text-caption text-state-error">{message}</p>}
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-caption text-text-muted">{label}</label>
      {children}
    </div>
  );
}
