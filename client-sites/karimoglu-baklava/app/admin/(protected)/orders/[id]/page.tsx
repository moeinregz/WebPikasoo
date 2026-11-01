import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { requirePageAccess } from "@/lib/auth/adminGuard";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { canActOnBranch, hasPermission } from "@/lib/auth/rbac";
import { getOrderById, getOrderStatusHistory } from "@/lib/server/orderRepo";
import { getPaymentsByOrderId } from "@/lib/server/paymentRepo";
import { getReservationByOrderId } from "@/lib/inventory/core";
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/server/orderStatusLabels";
import { OrderStatusForm } from "@/components/admin/OrderStatusForm";

export const dynamic = "force-dynamic";

function toman(amount: number): string {
  return `${amount.toLocaleString("fa-IR")} تومان`;
}

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const access = await requirePageAccess("orders.view");
  if (!access.allowed) return <AccessDenied />;

  const order = await getOrderById(params.id);
  if (!order) notFound();

  // مدیر شعبه فقط سفارش‌های شعبه خودش را می‌بیند — حتی اگر لینک مستقیم را داشته باشد
  if (!canActOnBranch(access.actor, order.branchId)) return <AccessDenied />;

  const history = await getOrderStatusHistory(order.id);
  const payments = await getPaymentsByOrderId(order.id);
  const reservation = await getReservationByOrderId(order.id);
  const canChangeStatus = hasPermission(access.actor.role, "orders.update_status");

  return (
    <Container className="flex flex-col gap-6 py-2">
      <div>
        <h1 className="text-h2 text-text-primary">سفارش {order.orderNumber}</h1>
        <p className="text-bodySm text-text-secondary">ثبت‌شده در {new Date(order.createdAt).toLocaleString("fa-IR")}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 desktop:grid-cols-3">
        <div className="flex flex-col gap-6 desktop:col-span-2">
          <section className="rounded-lg bg-surface p-4 shadow-sm">
            <h2 className="mb-3 text-h4 text-text-primary">اقلام سفارش</h2>
            <table className="w-full text-right text-bodySm">
              <thead className="border-b border-border text-caption text-text-muted">
                <tr>
                  <th className="p-2">محصول</th>
                  <th className="p-2">Variant</th>
                  <th className="p-2">بسته‌بندی</th>
                  <th className="p-2">تعداد</th>
                  <th className="p-2">قیمت واحد</th>
                  <th className="p-2">جمع</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.lineId} className="border-b border-border last:border-0">
                    <td className="p-2">{item.productName}</td>
                    <td className="p-2 text-caption text-text-muted">{item.variantLabel}</td>
                    <td className="p-2 text-caption text-text-muted">{item.packagingLabel}</td>
                    <td className="p-2">{item.quantity.toLocaleString("fa-IR")}</td>
                    <td className="p-2">{toman(item.unitPrice)}</td>
                    <td className="p-2 font-medium">{toman(item.lineTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4 flex flex-col gap-1 border-t border-border pt-3 text-bodySm">
              <Row label="جمع اقلام" value={toman(order.subtotal)} />
              <Row label="تخفیف" value={order.discountTotal > 0 ? `- ${toman(order.discountTotal)}` : "—"} />
              <Row label="هزینه ارسال" value={order.deliveryFeeIsPending ? "بعداً محاسبه می‌شود" : toman(order.deliveryFee)} />
              <Row label="مبلغ نهایی" value={toman(order.total)} bold />
            </div>
          </section>

          <section className="rounded-lg bg-surface p-4 shadow-sm">
            <h2 className="mb-3 text-h4 text-text-primary">Timeline وضعیت سفارش</h2>
            <ol className="flex flex-col gap-3">
              {history.map((entry) => (
                <li key={entry.id} className="flex items-start gap-3 text-bodySm">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-red" />
                  <div>
                    <p className="text-text-primary">
                      {ORDER_STATUS_LABELS[entry.status] ?? entry.status}
                      {entry.changedByRole && <span className="text-caption text-text-muted"> — توسط {entry.changedByRole}</span>}
                    </p>
                    {entry.note && <p className="text-caption text-text-muted">{entry.note}</p>}
                    <p className="text-caption text-text-muted">{new Date(entry.createdAt).toLocaleString("fa-IR")}</p>
                  </div>
                </li>
              ))}
            </ol>

            {canChangeStatus && (
              <div className="mt-4 border-t border-border pt-4">
                <OrderStatusForm orderId={order.id} currentStatus={order.status} />
              </div>
            )}
          </section>
        </div>

        <div className="flex flex-col gap-6">
          <section className="rounded-lg bg-surface p-4 shadow-sm">
            <h2 className="mb-3 text-h4 text-text-primary">مشتری</h2>
            <Row label="نام" value={order.customer.name} />
            <Row label="موبایل" value={order.customer.phone} ltr />
            <Row label="آدرس" value={order.address.fullAddress} />
            <Row label="شهر" value={order.address.city} />
          </section>

          <section className="rounded-lg bg-surface p-4 shadow-sm">
            <h2 className="mb-3 text-h4 text-text-primary">تحویل و شعبه</h2>
            <Row label="شعبه تأمین‌کننده" value={order.branchName} />
            <Row label="روش ارسال" value={order.deliveryMethod === "express" ? "فوری" : "همان‌روز"} />
            <Row label="بازه تحویل" value={`${order.etaMinutesMin}–${order.etaMinutesMax} دقیقه`} />
          </section>

          <section className="rounded-lg bg-surface p-4 shadow-sm">
            <h2 className="mb-3 text-h4 text-text-primary">پرداخت</h2>
            <Row label="روش پرداخت" value={order.paymentMethod === "online" ? "آنلاین" : order.paymentMethod} />
            <Row label="وضعیت پرداخت" value={PAYMENT_STATUS_LABELS[order.paymentStatus] ?? order.paymentStatus} />
            {payments.map((p) => (
              <div key={p.id} className="mt-2 border-t border-border pt-2 text-caption text-text-muted">
                <p>تراکنش: {p.id}</p>
                <p>وضعیت: {PAYMENT_STATUS_LABELS[p.status] ?? p.status}</p>
                {p.referenceId && <p dir="ltr">مرجع: {p.referenceId}</p>}
              </div>
            ))}
          </section>

          {reservation && (
            <section className="rounded-lg bg-surface p-4 shadow-sm">
              <h2 className="mb-3 text-h4 text-text-primary">وضعیت رزرو موجودی</h2>
              <Row label="وضعیت" value={reservation.status} />
            </section>
          )}
        </div>
      </div>
    </Container>
  );
}

function Row({ label, value, bold, ltr }: { label: string; value: string; bold?: boolean; ltr?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-caption text-text-muted">{label}</span>
      <span className={`text-bodySm ${bold ? "font-bold text-text-primary" : "text-text-primary"}`} dir={ltr ? "ltr" : undefined}>
        {value}
      </span>
    </div>
  );
}
