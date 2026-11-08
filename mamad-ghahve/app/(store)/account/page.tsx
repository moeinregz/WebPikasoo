import Link from "next/link";
import { redirect } from "next/navigation";
import { currentCustomer } from "@/lib/auth";
import { db, type Order } from "@/lib/db";
import { nextTier, tierOf } from "@/lib/club";
import { ORDER_STATUS, faDate } from "@/lib/format";
import { getSettings } from "@/lib/settings";
import { logoutAction } from "../club/actions";
import ProfileForm from "./ProfileForm";

export const metadata = { title: "حساب من" };

export default function Account() {
  const me = currentCustomer();
  if (!me) redirect("/club?next=/account");
  const s = getSettings();
  const tier = tierOf(me.total_spent);
  const nt = nextTier(me.total_spent);
  const progress = nt ? Math.min(100, Math.round(((me.total_spent - tier.min) / (nt.min - tier.min)) * 100)) : 100;
  const orders = db().prepare("SELECT * FROM orders WHERE customer_id = ? ORDER BY id DESC LIMIT 50").all(me.id) as Order[];
  const logs = db().prepare("SELECT * FROM point_logs WHERE customer_id = ? ORDER BY id DESC LIMIT 30").all(me.id) as { id: number; amount: number; reason: string; created_at: string }[];

  return (
    <div className="container">
      <div className="row between">
        <h1 className="page-title">سلام {me.name} 👋</h1>
        <form action={logoutAction}><button className="btn light sm">خروج</button></form>
      </div>

      <div className="grid2" style={{ alignItems: "start" }}>
        <div className="stack">
          <div className="member-card" style={{ background: `linear-gradient(135deg, #2a1810, ${tier.color})` }}>
            <div className="row between">
              <b>کارت باشگاه ممد قهوه</b>
              <span className="pill" style={{ background: "rgba(255,255,255,.2)", color: "#fff" }}>سطح {tier.name}</span>
            </div>
            <div>
              <div className="pts">{me.points.toLocaleString("fa-IR")}</div>
              <span style={{ opacity: 0.85 }}>امتیاز ≈ {(me.points * Number(s.club_point_value || 0)).toLocaleString("fa-IR")} تومان اعتبار</span>
            </div>
            <span dir="ltr" style={{ opacity: 0.8, letterSpacing: 2 }}>{me.phone}</span>
          </div>
          <div className="card">
            {nt ? (
              <>
                <p style={{ fontSize: ".9rem" }}>
                  {(nt.min - me.total_spent).toLocaleString("fa-IR")} تومان دیگه تا سطح <b>{nt.name}</b>
                </p>
                <div className="bar" style={{ marginTop: 8 }}><i style={{ width: progress + "%" }} /></div>
              </>
            ) : (
              <p>🏆 تو بالاترین سطح باشگاهی!</p>
            )}
          </div>
          <div className="card">
            <b>تاریخچه‌ی امتیاز</b>
            {logs.length ? (
              <table className="tbl" style={{ marginTop: 8 }}>
                <tbody>
                  {logs.map((l) => (
                    <tr key={l.id}>
                      <td>{l.reason}</td>
                      <td className="muted" style={{ fontSize: ".8rem" }}>{faDate(l.created_at)}</td>
                      <td style={{ color: l.amount > 0 ? "var(--ok)" : "var(--bad)", fontWeight: 700, direction: "ltr", textAlign: "left" }}>
                        {(l.amount > 0 ? "+" : "") + l.amount.toLocaleString("fa-IR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="muted">هنوز امتیازی ثبت نشده.</p>
            )}
          </div>
        </div>

        <div className="stack">
          <div className="card">
            <b>سفارش‌های من</b>
            {orders.length ? (
              <div className="tbl-wrap">
                <table className="tbl" style={{ marginTop: 8 }}>
                  <thead><tr><th>کد</th><th>تاریخ</th><th>مبلغ</th><th>وضعیت</th></tr></thead>
                  <tbody>
                    {orders.map((o) => {
                      const st = ORDER_STATUS[o.status];
                      return (
                        <tr key={o.id}>
                          <td><Link href={`/order/${o.code}`} style={{ color: "var(--caramel)", fontWeight: 700 }} dir="ltr">{o.code}</Link></td>
                          <td style={{ fontSize: ".8rem" }}>{faDate(o.created_at)}</td>
                          <td>{o.total.toLocaleString("fa-IR")}</td>
                          <td><span className={`pill ${st?.tone || ""}`}>{st?.label || o.status}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="muted">هنوز سفارشی نداری. <Link href="/shop" style={{ color: "var(--caramel)" }}>بریم خرید</Link></p>
            )}
          </div>
          <ProfileForm me={{ name: me.name, city: me.city, address: me.address, postal_code: me.postal_code, birthday: me.birthday }} />
        </div>
      </div>
    </div>
  );
}
