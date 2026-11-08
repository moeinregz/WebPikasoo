import Link from "next/link";
import { db, type Product } from "@/lib/db";
import ProductArt from "@/components/ProductArt";
import { quickStockAction, toggleProductAction, basalamPushAction } from "../../actions";
import { StateForm, Submit } from "../../ui";
import { basalamReady } from "@/lib/basalam";

export const metadata = { title: "محصولات" };

export default function Products({ searchParams }: { searchParams: { q?: string; deleted?: string } }) {
  const q = (searchParams.q || "").slice(0, 60);
  const rows = db()
    .prepare(`SELECT p.*, c.name category_name FROM products p LEFT JOIN categories c ON c.id = p.category_id ${q ? "WHERE p.name LIKE ?" : ""} ORDER BY p.id DESC`)
    .all(...(q ? [`%${q}%`] : [])) as Product[];
  return (
    <>
      <div className="row between">
        <h1>محصولات</h1>
        <Link href="/admin/products/new" className="btn">+ محصول جدید</Link>
      </div>
      {searchParams.deleted && <div className="alert ok" style={{ marginBottom: 12 }}>محصول حذف شد.</div>}
      <div className="row" style={{ marginBottom: 14 }}>
        <form className="row grow" style={{ flexWrap: "nowrap" }}>
          <input className="input" name="q" defaultValue={q} placeholder="جستجوی محصول…" />
          <button className="btn light">جستجو</button>
        </form>
        {basalamReady() && (
          <StateForm action={basalamPushAction} className="row">
            <Submit className="btn light">🛍️ ارسال همه به باسلام</Submit>
          </StateForm>
        )}
      </div>
      <div className="card tbl-wrap" style={{ padding: 8 }}>
        <table className="tbl">
          <thead>
            <tr><th></th><th>نام</th><th>دسته</th><th>قیمت / موجودی</th><th>فروش</th><th>وضعیت</th><th></th></tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id}>
                <td><div className="thumb-sm"><ProductArt image={p.image} color={p.color} name={p.name} /></div></td>
                <td>
                  <Link href={`/admin/products/${p.id}`} style={{ fontWeight: 700 }}>{p.name}</Link>
                  {p.is_featured ? <span className="pill" style={{ marginInlineStart: 6 }}>ویژه</span> : null}
                  {p.basalam_id ? <span className="pill info" style={{ marginInlineStart: 6 }}>باسلام</span> : null}
                </td>
                <td className="muted">{p.category_name || "—"}</td>
                <td>
                  <form action={quickStockAction} className="row" style={{ flexWrap: "nowrap", gap: 6 }}>
                    <input type="hidden" name="id" value={p.id} />
                    <input className="input" name="price" defaultValue={p.price} style={{ width: 110, padding: "6px 8px" }} dir="ltr" aria-label="قیمت" />
                    <input className="input" name="stock" defaultValue={p.stock} style={{ width: 64, padding: "6px 8px" }} dir="ltr" aria-label="موجودی" />
                    <button className="btn light sm">✓</button>
                  </form>
                </td>
                <td>{p.sales_count.toLocaleString("fa-IR")}</td>
                <td>
                  <form action={toggleProductAction}>
                    <input type="hidden" name="id" value={p.id} />
                    <button className={`pill ${p.is_active ? "ok" : "bad"}`}>{p.is_active ? "فعال" : "غیرفعال"}</button>
                  </form>
                </td>
                <td><Link href={`/admin/products/${p.id}`} className="btn light sm">ویرایش</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <p className="muted center" style={{ padding: 20 }}>محصولی نیست.</p>}
      </div>
    </>
  );
}
