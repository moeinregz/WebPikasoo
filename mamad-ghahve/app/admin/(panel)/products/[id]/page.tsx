import Link from "next/link";
import { notFound } from "next/navigation";
import { db, type Product } from "@/lib/db";
import { categories } from "@/lib/products";
import ProductArt from "@/components/ProductArt";
import { basalamPushAction, deleteProductAction, saveProductAction } from "../../../actions";
import { ConfirmButton, StateForm, Submit } from "../../../ui";
import { basalamReady } from "@/lib/basalam";

export const metadata = { title: "ویرایش محصول" };

const EMPTY: Partial<Product> = { name: "", short_desc: "", description: "", price: 0, compare_price: 0, stock: 10, weight: 250, options: "", image: "", color: "#6b3f26", badge: "", is_active: 1, is_featured: 0 };

export default function EditProduct({ params, searchParams }: { params: { id: string }; searchParams: { saved?: string } }) {
  const isNew = params.id === "new";
  const p = isNew ? EMPTY : (db().prepare("SELECT * FROM products WHERE id = ?").get(Number(params.id)) as Product | undefined);
  if (!p) notFound();
  const cats = categories();

  return (
    <>
      <div className="row between">
        <h1>{isNew ? "محصول جدید" : `ویرایش «${p.name}»`}</h1>
        <Link href="/admin/products" className="btn light sm">← برگشت</Link>
      </div>
      {searchParams.saved && <div className="alert ok" style={{ marginBottom: 12 }}>ذخیره شد ✓ {!isNew && <Link href={`/product/${p.id}`} target="_blank" style={{ textDecoration: "underline" }}>دیدن در سایت</Link>}</div>}
      <div className="edit-grid">
        <StateForm action={saveProductAction} className="card stack">
          <input type="hidden" name="id" value={p.id || ""} />
          <div className="grid2">
            <div className="field span2"><label>نام محصول *</label><input name="name" defaultValue={p.name} required /></div>
            <div className="field">
              <label>دسته‌بندی</label>
              <select name="category_id" defaultValue={p.category_id ?? ""}>
                <option value="">— بدون دسته —</option>
                {cats.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div className="field"><label>برچسب روی کارت</label><input name="badge" defaultValue={p.badge} placeholder="جدید، پرفروش، ویژه…" /></div>
            <div className="field"><label>قیمت (تومان) *</label><input name="price" defaultValue={p.price || ""} required dir="ltr" inputMode="numeric" /></div>
            <div className="field"><label>قیمت قبل از تخفیف (تومان)</label><input name="compare_price" defaultValue={p.compare_price || ""} dir="ltr" inputMode="numeric" /><small>خالی = بدون تخفیف</small></div>
            <div className="field"><label>موجودی</label><input name="stock" defaultValue={p.stock} dir="ltr" inputMode="numeric" /></div>
            <div className="field"><label>وزن (گرم)</label><input name="weight" defaultValue={p.weight} dir="ltr" inputMode="numeric" /></div>
            <div className="field span2"><label>توضیح کوتاه</label><input name="short_desc" defaultValue={p.short_desc} /></div>
            <div className="field span2"><label>توضیحات کامل</label><textarea name="description" defaultValue={p.description} /></div>
            <div className="field span2"><label>گزینه‌ها (نوع آسیاب و…)</label><input name="options" defaultValue={p.options} placeholder="دانه,آسیاب اسپرسو,آسیاب موکاپات" /><small>با ویرگول جدا کن. خالی = بدون گزینه.</small></div>
            <div className="field"><label>عکس محصول</label><input type="file" name="image_file" accept="image/*" /><small>JPG/PNG/WEBP تا ۵ مگ — عکس مربعی بهترین نتیجه رو می‌ده</small></div>
            <div className="field"><label>یا آدرس عکس (URL)</label><input name="image_url" defaultValue={p.image} dir="ltr" placeholder="https://…" /></div>
            <div className="field"><label>رنگ بسته (وقتی عکس نداره)</label><input type="color" name="color" defaultValue={p.color} style={{ height: 46, padding: 4 }} /></div>
            <div className="field" style={{ justifyContent: "flex-end" }}>
              <label className="check"><input type="checkbox" name="is_active" defaultChecked={!!p.is_active} /> نمایش در سایت</label>
              <label className="check"><input type="checkbox" name="is_featured" defaultChecked={!!p.is_featured} /> پیشنهاد ویژه</label>
              {p.image && <label className="check"><input type="checkbox" name="remove_image" /> حذف عکس فعلی</label>}
            </div>
          </div>
          <Submit>💾 ذخیره‌ی محصول</Submit>
        </StateForm>

        <div className="stack">
          <div className="card">
            <b>پیش‌نمایش عکس</b>
            <div style={{ borderRadius: 16, overflow: "hidden", marginTop: 8, aspectRatio: "1/1" }}>
              <ProductArt image={p.image} color={p.color} name={p.name || "محصول"} />
            </div>
          </div>
          {!isNew && (
            <>
              <div className="card stack">
                <b>🛍️ باسلام</b>
                {p.basalam_id ? <p className="muted" style={{ fontSize: ".85rem" }}>شناسه در باسلام: {p.basalam_id}</p> : <p className="muted" style={{ fontSize: ".85rem" }}>هنوز به باسلام فرستاده نشده.</p>}
                {basalamReady() ? (
                  <StateForm action={basalamPushAction}>
                    <input type="hidden" name="id" value={p.id} />
                    <Submit className="btn light block">{p.basalam_id ? "به‌روزرسانی در باسلام" : "ارسال به غرفه‌ی باسلام"}</Submit>
                  </StateForm>
                ) : (
                  <p style={{ fontSize: ".85rem" }}>برای فعال شدن، اطلاعات باسلام رو تو <Link href="/admin/settings" style={{ color: "var(--caramel)" }}>تنظیمات</Link> وارد کن.</p>
                )}
              </div>
              <form action={deleteProductAction} className="card">
                <input type="hidden" name="id" value={p.id} />
                <ConfirmButton message="این محصول برای همیشه حذف بشه؟" className="btn danger block">🗑 حذف محصول</ConfirmButton>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}
