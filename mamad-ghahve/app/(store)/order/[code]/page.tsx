import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { orderByCode, orderItems } from "@/lib/orders";
import { currentCustomer, currentAdminId } from "@/lib/auth";
import { ORDER_STATUS, faDateTime } from "@/lib/format";
import ClearCart from "./ClearCart";

export const metadata = { title: "وضعیت سفارش" };

export default function OrderPage({ params, searchParams }: { params: { code: string }; searchParams: { msg?: string } }) {
  const o = orderByCode(params.code);
  if (!o) notFound();
  const me = currentCustomer();
  const mine = (cookies().get("mg_orders")?.value || "").split(",").includes(o.code);
  if (!mine && !(me && me.id === o.customer_id) && !currentAdminId()) notFound();

  const items = orderItems(o.id);
  const st = ORDER_STATUS[o.status] || { label: o.status, tone: "" };
  const ok = !["pending", "failed", "cancelled"].includes(o.status);

  return (
    <div className="container" style={{ maxWidth: 720 }}>
      {ok && <ClearCart />}
      <div className="card center" style={{ marginTop: 26 }}>
        <div style={{ fontSize: "3.6rem" }}>{ok ? "🎉" : o.status === "pending" ? "⏳" : "😕"}</div>
        <h1 className="display" style={{ fontSize: "2rem", color: "var(--head)" }}>
          {ok ? "سفارشت ثبت شد!" : o.status === "pending" ? "در انتظار پرداخت" : "پرداخت ناموفق بود"}
        </h1>
        {searchParams.msg && !ok && <p className="alert bad" style={{ margin: "10px 0" }}>{searchParams.msg}</p>}
        <p className="muted">کد سفارش: <b dir="ltr">{o.code}</b></p>
        {o.payment_ref && <p className="muted">کد پیگیری پرداخت: <b dir="ltr">{o.payment_ref}</b></p>}
        {o.points_earned > 0 && <p className="alert ok" style={{ marginTop: 10 }}>🎁 {o.points_earned.toLocaleString("fa-IR")} امتیاز به باشگاهت اضافه شد.</p>}
        <span className={`pill ${st.tone}`} style={{ marginTop: 10 }}>{st.label}</span>
      </div>
      <div className="card summary" style={{ marginTop: 16 }}>
        <b>جزئیات</b>
        <p className="muted" style={{ fontSize: ".85rem" }}>{faDateTime(o.created_at)}</p>
        {items.map((it) => (
          <div className="r" key={it.id}>
            <span>{it.name} {it.option && <small className="muted">({it.option})</small>} × {it.qty.toLocaleString("fa-IR")}</span>
            <span>{(it.price * it.qty).toLocaleString("fa-IR")}</span>
          </div>
        ))}
        {o.discount > 0 && <div className="r green"><span>تخفیف</span><span>−{o.discount.toLocaleString("fa-IR")}</span></div>}
        {o.points_discount > 0 && <div className="r green"><span>امتیاز باشگاه</span><span>−{o.points_discount.toLocaleString("fa-IR")}</span></div>}
        <div className="r"><span>ارسال</span><span>{o.shipping ? o.shipping.toLocaleString("fa-IR") : "رایگان"}</span></div>
        <div className="r total"><span>مبلغ کل</span><span>{o.total.toLocaleString("fa-IR")} تومان</span></div>
        <p style={{ marginTop: 10, fontSize: ".9rem" }}>📍 {o.name} — {o.city}، {o.address}</p>
        {o.tracking_code && <p style={{ fontSize: ".9rem" }}>📮 کد رهگیری پست: <b dir="ltr">{o.tracking_code}</b></p>}
      </div>
      <div className="row" style={{ justifyContent: "center", marginTop: 18 }}>
        {!ok && <Link href="/checkout" className="btn">تلاش دوباره</Link>}
        <Link href="/shop" className="btn light">ادامه‌ی خرید</Link>
        {me && <Link href="/account" className="btn light">سفارش‌های من</Link>}
      </div>
    </div>
  );
}
