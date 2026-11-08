import Link from "next/link";
import { db, type Order } from "@/lib/db";
import { ORDER_STATUS, faDateTime } from "@/lib/format";

export const metadata = { title: "سفارش‌ها" };

export default function Orders({ searchParams }: { searchParams: { status?: string; q?: string } }) {
  const where: string[] = [];
  const args: unknown[] = [];
  if (searchParams.status && ORDER_STATUS[searchParams.status]) {
    where.push("status = ?");
    args.push(searchParams.status);
  }
  if (searchParams.q) {
    where.push("(code LIKE ? OR name LIKE ? OR phone LIKE ?)");
    const l = `%${searchParams.q.slice(0, 40)}%`;
    args.push(l, l, l);
  }
  const rows = db().prepare(`SELECT * FROM orders ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY id DESC LIMIT 300`).all(...args) as Order[];
  return (
    <>
      <h1>سفارش‌ها</h1>
      <div className="filters">
        <Link href="/admin/orders" className={!searchParams.status ? "on" : ""}>همه</Link>
        {Object.entries(ORDER_STATUS).map(([k, v]) => (
          <Link key={k} href={`/admin/orders?status=${k}`} className={searchParams.status === k ? "on" : ""}>{v.label}</Link>
        ))}
      </div>
      <form className="row" style={{ flexWrap: "nowrap", marginBottom: 12 }}>
        {searchParams.status && <input type="hidden" name="status" value={searchParams.status} />}
        <input className="input" name="q" defaultValue={searchParams.q} placeholder="کد سفارش، نام یا موبایل" />
        <button className="btn light">جستجو</button>
      </form>
      <div className="card tbl-wrap" style={{ padding: 8 }}>
        <table className="tbl">
          <thead><tr><th>کد</th><th>مشتری</th><th>مبلغ</th><th>درگاه</th><th>وضعیت</th><th>تاریخ</th></tr></thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.id}>
                <td><Link href={`/admin/orders/${o.id}`} style={{ color: "var(--caramel)", fontWeight: 700 }} dir="ltr">{o.code}</Link></td>
                <td>{o.name}<div className="muted" dir="ltr" style={{ fontSize: ".75rem", textAlign: "right" }}>{o.phone}</div></td>
                <td>{o.total.toLocaleString("fa-IR")}</td>
                <td className="muted">{o.payment_provider}</td>
                <td><span className={`pill ${ORDER_STATUS[o.status]?.tone}`}>{ORDER_STATUS[o.status]?.label}</span></td>
                <td className="muted" style={{ fontSize: ".78rem" }}>{faDateTime(o.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <p className="muted center" style={{ padding: 20 }}>سفارشی پیدا نشد.</p>}
      </div>
    </>
  );
}
