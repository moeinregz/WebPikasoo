import { db } from "@/lib/db";
import { categories } from "@/lib/products";
import { deleteCategoryAction, saveCategoryAction } from "../../actions";
import { ConfirmButton } from "../../ui";

export const metadata = { title: "دسته‌بندی‌ها" };

export default function Categories() {
  const cats = categories();
  const counts = Object.fromEntries((db().prepare("SELECT category_id, COUNT(*) c FROM products GROUP BY category_id").all() as { category_id: number; c: number }[]).map((r) => [r.category_id, r.c]));
  return (
    <>
      <h1>دسته‌بندی‌ها</h1>
      <div className="card stack">
        <b>+ دسته‌ی جدید</b>
        <form action={saveCategoryAction} className="inline-form">
          <div className="field"><label>نام</label><input name="name" required /></div>
          <div className="field"><label>نامک انگلیسی (برای آدرس)</label><input name="slug" dir="ltr" placeholder="beans" /></div>
          <div className="field"><label>ایموجی</label><input name="icon" defaultValue="☕" /></div>
          <div className="field"><label>ترتیب</label><input name="sort" defaultValue={cats.length} dir="ltr" /></div>
          <button className="btn">افزودن</button>
        </form>
      </div>
      <div className="stack" style={{ marginTop: 14 }}>
        {cats.map((c) => (
          <div className="card" key={c.id} style={{ padding: 14 }}>
            <form action={saveCategoryAction} className="inline-form">
              <input type="hidden" name="id" value={c.id} />
              <div className="field"><label>نام ({(counts[c.id] || 0).toLocaleString("fa-IR")} محصول)</label><input name="name" defaultValue={c.name} required /></div>
              <div className="field"><label>نامک</label><input name="slug" defaultValue={c.slug} dir="ltr" /></div>
              <div className="field"><label>ایموجی</label><input name="icon" defaultValue={c.icon} /></div>
              <div className="field"><label>ترتیب</label><input name="sort" defaultValue={c.sort} dir="ltr" /></div>
              <button className="btn light">ذخیره</button>
            </form>
            <form action={deleteCategoryAction} style={{ marginTop: 8 }}>
              <input type="hidden" name="id" value={c.id} />
              <ConfirmButton message="دسته حذف بشه؟ محصولاتش بدون دسته می‌شن.">حذف</ConfirmButton>
            </form>
          </div>
        ))}
      </div>
    </>
  );
}
