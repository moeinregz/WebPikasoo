import { db, type Customer } from "@/lib/db";
import { tierOf } from "@/lib/club";
import { faDate } from "@/lib/format";
import { adjustPointsAction } from "../../actions";

export const metadata = { title: "باشگاه مشتریان" };

export default function Customers({ searchParams }: { searchParams: { q?: string } }) {
  const q = (searchParams.q || "").slice(0, 40);
  const rows = db()
    .prepare(`SELECT c.*, (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id AND o.status IN ('paid','processing','shipped','delivered')) orders_count FROM customers c ${q ? "WHERE c.name LIKE ? OR c.phone LIKE ?" : ""} ORDER BY c.total_spent DESC LIMIT 300`)
    .all(...(q ? [`%${q}%`, `%${q}%`] : [])) as (Customer & { orders_count: number })[];
  const sum = db().prepare("SELECT COUNT(*) c, COALESCE(SUM(points),0) p FROM customers").get() as { c: number; p: number };
  return (
    <>
      <h1>باشگاه مشتریان</h1>
      <div className="stats" style={{ marginBottom: 14 }}>
        <div className="stat"><span>اعضا</span><b>{sum.c.toLocaleString("fa-IR")}</b></div>
        <div className="stat"><span>امتیازهای خرج‌نشده</span><b>{sum.p.toLocaleString("fa-IR")}</b></div>
      </div>
      <form className="row" style={{ flexWrap: "nowrap", marginBottom: 12 }}>
        <input className="input" name="q" defaultValue={q} placeholder="نام یا موبایل" />
        <button className="btn light">جستجو</button>
      </form>
      <div className="card tbl-wrap" style={{ padding: 8 }}>
        <table className="tbl">
          <thead><tr><th>نام</th><th>موبایل</th><th>سطح</th><th>خرید</th><th>امتیاز</th><th>عضویت</th><th>افزودن/کسر امتیاز</th></tr></thead>
          <tbody>
            {rows.map((c) => {
              const t = tierOf(c.total_spent);
              return (
                <tr key={c.id}>
                  <td>{c.name}{c.birthday && <div className="muted" style={{ fontSize: ".72rem" }}>🎂 {c.birthday}</div>}</td>
                  <td dir="ltr" style={{ textAlign: "right" }}>{c.phone}</td>
                  <td><span className="pill" style={{ background: t.color, color: "#fff" }}>{t.name}</span></td>
                  <td>{c.total_spent.toLocaleString("fa-IR")}<div className="muted" style={{ fontSize: ".72rem" }}>{c.orders_count.toLocaleString("fa-IR")} سفارش</div></td>
                  <td><b>{c.points.toLocaleString("fa-IR")}</b></td>
                  <td className="muted" style={{ fontSize: ".78rem" }}>{faDate(c.created_at)}</td>
                  <td>
                    <form action={adjustPointsAction} className="row" style={{ flexWrap: "nowrap", gap: 4 }}>
                      <input type="hidden" name="id" value={c.id} />
                      <input className="input" name="amount" placeholder="+۵۰ یا -۲۰" style={{ width: 90, padding: "6px 8px" }} dir="ltr" />
                      <input className="input" name="reason" placeholder="دلیل" style={{ width: 110, padding: "6px 8px" }} />
                      <button className="btn light sm">✓</button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!rows.length && <p className="muted center" style={{ padding: 20 }}>هنوز عضوی نیست.</p>}
      </div>
    </>
  );
}
