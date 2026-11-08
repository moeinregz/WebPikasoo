import Link from "next/link";
import { notFound } from "next/navigation";
import { db, type Order } from "@/lib/db";
import { orderItems } from "@/lib/orders";
import { ORDER_STATUS, faDateTime } from "@/lib/format";
import { updateOrderAction } from "../../../actions";
import { StateForm, Submit } from "../../../ui";

export const metadata = { title: "جزئیات سفارش" };

export default function OrderDetail({ params }: { params: { id: string } }) {
  const o = db().prepare("SELECT * FROM orders WHERE id = ?").get(Number(params.id)) as Order | undefined;
  if (!o) notFound();
  const items = orderItems(o.id);
  const st = ORDER_STATUS[o.status];
  return (
    <>
      <div className="row between">
        <h1>سفارش <span dir="ltr">{o.code}</span></h1>
        <Link href="/admin/orders" className="btn light sm">← سفارش‌ها</Link>
      </div>
      <div className="edit-grid">
        <div className="stack">
          <div className="card summary">
            <div className="row between"><b>اقلام</b><span className={`pill ${st?.tone}`}>{st?.label}</span></div>
            {items.map((it) => (
              <div className="r" key={it.id}>
                <span>
                  {it.product_id ? <Link href={`/admin/products/${it.product_id}`}>{it.name}</Link> : it.name}
                  {it.option && <small className="muted"> ({it.option})</small>} × {it.qty.toLocaleString("fa-IR")}
                </span>
                <span>{(it.price * it.qty).toLocaleString("fa-IR")}</span>
              </div>
            ))}
            <div className="r"><span>جمع</span><span>{o.subtotal.toLocaleString("fa-IR")}</span></div>
            {o.discount > 0 && <div className="r green"><span>کد تخفیف {o.coupon_code}</span><span>−{o.discount.toLocaleString("fa-IR")}</span></div>}
            {o.points_discount > 0 && <div className="r green"><span>امتیاز ({o.points_used.toLocaleString("fa-IR")})</span><span>−{o.points_discount.toLocaleString("fa-IR")}</span></div>}
            <div className="r"><span>ارسال</span><span>{o.shipping.toLocaleString("fa-IR")}</span></div>
            <div className="r total"><span>مبلغ کل</span><span>{o.total.toLocaleString("fa-IR")} تومان</span></div>
          </div>
          <div className="card">
            <b>گیرنده</b>
            <p>{o.name} — <span dir="ltr">{o.phone}</span></p>
            <p>{o.city}، {o.address}</p>
            {o.postal_code && <p>کد پستی: {o.postal_code}</p>}
            {o.note && <p className="muted">یادداشت: {o.note}</p>}
          </div>
        </div>
        <div className="stack">
          <StateForm action={updateOrderAction} className="card stack">
            <input type="hidden" name="id" value={o.id} />
            <div className="field">
              <label>وضعیت سفارش</label>
              <select name="status" defaultValue={o.status}>
                {Object.entries(ORDER_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
              <small>«پرداخت شده» دستی (مثلاً کارت‌به‌کارت) موجودی رو کم و امتیاز مشتری رو اضافه می‌کنه.</small>
            </div>
            <div className="field"><label>کد رهگیری پست</label><input name="tracking_code" defaultValue={o.tracking_code} dir="ltr" /></div>
            {o.payment_provider === "digipay" && <small className="muted">دیجی‌پی اعتباری/اقساطی: با زدن «ارسال شده»، تحویل خودکار به دیجی‌پی اعلام می‌شه.</small>}
            <Submit>ذخیره</Submit>
          </StateForm>
          <div className="card" style={{ fontSize: ".88rem" }}>
            <b>پرداخت</b>
            <p>درگاه: {o.payment_provider || "—"}</p>
            <p>کد پیگیری: <span dir="ltr">{o.payment_ref || "—"}</span></p>
            <p>ثبت: {faDateTime(o.created_at)}</p>
            {o.paid_at && <p>پرداخت: {faDateTime(o.paid_at)}</p>}
            {o.points_earned > 0 && <p>امتیاز داده‌شده: {o.points_earned.toLocaleString("fa-IR")}</p>}
          </div>
        </div>
      </div>
    </>
  );
}
