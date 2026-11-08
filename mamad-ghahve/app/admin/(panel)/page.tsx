import Link from "next/link";
import { db, type Order } from "@/lib/db";
import { ORDER_STATUS, faDateTime } from "@/lib/format";
import { getSettings } from "@/lib/settings";

export default function Dashboard() {
  const d = db();
  const one = <T,>(sql: string, ...a: unknown[]) => d.prepare(sql).get(...a) as T;
  const PAID = "status IN ('paid','processing','shipped','delivered')";
  const today = one<{ c: number; s: number }>(`SELECT COUNT(*) c, COALESCE(SUM(total),0) s FROM orders WHERE ${PAID} AND date(paid_at) = date('now')`);
  const month = one<{ c: number; s: number }>(`SELECT COUNT(*) c, COALESCE(SUM(total),0) s FROM orders WHERE ${PAID} AND paid_at >= datetime('now','-30 days')`);
  const toShip = one<{ c: number }>(`SELECT COUNT(*) c FROM orders WHERE status IN ('paid','processing')`);
  const members = one<{ c: number }>(`SELECT COUNT(*) c FROM customers`);
  const low = d.prepare("SELECT id, name, stock FROM products WHERE is_active = 1 AND stock <= 5 ORDER BY stock LIMIT 8").all() as { id: number; name: string; stock: number }[];
  const recent = d.prepare("SELECT * FROM orders ORDER BY id DESC LIMIT 8").all() as Order[];
  const top = d.prepare("SELECT id, name, sales_count FROM products ORDER BY sales_count DESC LIMIT 5").all() as { id: number; name: string; sales_count: number }[];
  const s = getSettings();
  const realGw = ["zarinpal_enabled", "snappay_enabled", "digipay_enabled"].some((k) => s[k] === "1");

  return (
    <>
      <h1>داشبورد</h1>
      {s.pay_mock_enabled === "1" && (
        <div className="alert warn" style={{ marginBottom: 14 }}>
          ⚠️ درگاه آزمایشی روشنه. قبل از شروع فروش واقعی، از <Link href="/admin/settings" style={{ textDecoration: "underline" }}>تنظیمات</Link> خاموشش کن{realGw ? "" : " و یه درگاه واقعی فعال کن"}.
        </div>
      )}
      <div className="stats">
        <div className="stat"><span>فروش امروز</span><b>{today.s.toLocaleString("fa-IR")}</b><span>{today.c.toLocaleString("fa-IR")} سفارش</span></div>
        <div className="stat"><span>فروش ۳۰ روز</span><b>{month.s.toLocaleString("fa-IR")}</b><span>{month.c.toLocaleString("fa-IR")} سفارش</span></div>
        <div className="stat"><span>منتظر ارسال</span><b>{toShip.c.toLocaleString("fa-IR")}</b><span><Link href="/admin/orders?status=paid">مشاهده</Link></span></div>
        <div className="stat"><span>اعضای باشگاه</span><b>{members.c.toLocaleString("fa-IR")}</b><span>مشتری</span></div>
      </div>
      <div className="grid2" style={{ marginTop: 18, alignItems: "start" }}>
        <div className="card">
          <div className="row between"><b>آخرین سفارش‌ها</b><Link href="/admin/orders" className="muted">همه</Link></div>
          <div className="tbl-wrap">
            <table className="tbl">
              <tbody>
                {recent.map((o) => (
                  <tr key={o.id}>
                    <td><Link href={`/admin/orders/${o.id}`} style={{ color: "var(--caramel)", fontWeight: 700 }} dir="ltr">{o.code}</Link></td>
                    <td>{o.name}</td>
                    <td>{o.total.toLocaleString("fa-IR")}</td>
                    <td><span className={`pill ${ORDER_STATUS[o.status]?.tone}`}>{ORDER_STATUS[o.status]?.label}</span></td>
                    <td className="muted" style={{ fontSize: ".75rem" }}>{faDateTime(o.created_at)}</td>
                  </tr>
                ))}
                {!recent.length && <tr><td className="muted">هنوز سفارشی ثبت نشده.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
        <div className="stack">
          <div className="card">
            <b>⚠️ موجودی کم</b>
            {low.length ? (
              <ul style={{ marginTop: 6 }}>
                {low.map((p) => (
                  <li key={p.id} className="row between" style={{ padding: "4px 0" }}>
                    <Link href={`/admin/products/${p.id}`}>{p.name}</Link>
                    <span className={`pill ${p.stock ? "warn" : "bad"}`}>{p.stock.toLocaleString("fa-IR")}</span>
                  </li>
                ))}
              </ul>
            ) : <p className="muted">همه‌چی موجوده 👌</p>}
          </div>
          <div className="card">
            <b>🔥 پرفروش‌ها</b>
            <ul style={{ marginTop: 6 }}>
              {top.map((p) => (
                <li key={p.id} className="row between" style={{ padding: "4px 0" }}>
                  <Link href={`/admin/products/${p.id}`}>{p.name}</Link>
                  <span className="muted">{p.sales_count.toLocaleString("fa-IR")} فروش</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
