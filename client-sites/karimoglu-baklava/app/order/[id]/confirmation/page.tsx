import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { db } from "@/lib/server/db";
import { canCancelOrder } from "@/lib/server/orderService";
import { formatToman } from "@/lib/format";
import { CancelOrderButton } from "../CancelOrderButton";

// داده‌ها از PostgreSQL می‌آیند؛ صفحه نباید موقع Build (بدون دسترسی به دیتابیس) استاتیک ساخته و ثابت بماند.
export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  pending_payment: "در انتظار پرداخت",
  confirmed: "تأیید شده",
  preparing: "در حال آماده‌سازی",
  out_for_delivery: "در مسیر ارسال",
  delivered: "تحویل داده‌شده",
  cancelled: "لغو شده",
};

const paymentStatusLabels: Record<string, string> = {
  not_required: "نیازی به پرداخت آنلاین نیست",
  pending: "در انتظار پرداخت",
  succeeded: "پرداخت موفق",
  failed: "پرداخت ناموفق",
  cancelled: "پرداخت لغو شده",
};

export default async function OrderConfirmationPage({ params }: { params: { id: string } }) {
  // خواندن مستقیم از لایه سرور (In-memory Store فعلی) — چون این یک Server
  // Component است، نیازی به یک Round-trip اضافه به API خودمان نیست.
  const order = await db.orders.get(params.id);
  if (!order) notFound();

  const canCancel = canCancelOrder(order);

  return (
    <Container className="flex flex-col gap-8 py-10">
      <div className="flex flex-col items-center gap-2 text-center">
        <span aria-hidden="true" className="text-h1">
          {order.status === "cancelled" ? "✕" : "✓"}
        </span>
        <h1 className="text-h2 text-text-primary">
          {order.status === "cancelled" ? "سفارش لغو شد" : "سفارش شما با موفقیت ثبت شد"}
        </h1>
        <p className="text-bodySm text-text-muted">شماره سفارش: {order.orderNumber}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
        <div className="rounded-lg bg-surface p-5 shadow-sm">
          <span className="text-label text-text-secondary">وضعیت سفارش</span>
          <p className="text-h4 text-text-primary">{statusLabels[order.status] ?? order.status}</p>
        </div>
        <div className="rounded-lg bg-surface p-5 shadow-sm">
          <span className="text-label text-text-secondary">وضعیت پرداخت</span>
          <p className="text-h4 text-text-primary">
            {paymentStatusLabels[order.paymentStatus] ?? order.paymentStatus}
          </p>
        </div>
        <div className="rounded-lg bg-surface p-5 shadow-sm">
          <span className="text-label text-text-secondary">شعبه تأمین‌کننده</span>
          <p className="text-h4 text-text-primary">{order.branchName}</p>
        </div>
        <div className="rounded-lg bg-surface p-5 shadow-sm">
          <span className="text-label text-text-secondary">زمان تقریبی تحویل</span>
          <p className="text-h4 text-text-primary">
            {order.etaMinutesMin.toLocaleString("fa-IR")} تا {order.etaMinutesMax.toLocaleString("fa-IR")} دقیقه
          </p>
        </div>
      </div>

      <div className="rounded-lg bg-surface p-5 shadow-sm">
        <h2 className="mb-3 text-h4 text-text-primary">خلاصه سفارش</h2>
        <ul className="flex flex-col gap-2">
          {order.items.map((item) => (
            <li key={item.lineId} className="flex items-center justify-between text-bodySm">
              <span className="text-text-secondary">
                {item.productName} — {item.variantLabel} × {item.quantity.toLocaleString("fa-IR")}
              </span>
              <span className="text-text-primary">{formatToman(item.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-col gap-1 border-t border-border pt-4 text-bodySm">
          <div className="flex justify-between">
            <span className="text-text-secondary">جمع کالاها</span>
            <span>{formatToman(order.subtotal)}</span>
          </div>
          {order.discountTotal > 0 && (
            <div className="flex justify-between text-state-success">
              <span>تخفیف</span>
              <span>−{formatToman(order.discountTotal)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-text-secondary">هزینه ارسال</span>
            <span>{order.deliveryFeeIsPending ? "پس از هماهنگی اعلام می‌شود" : formatToman(order.deliveryFee)}</span>
          </div>
          <div className="flex justify-between text-price text-text-primary">
            <span>مبلغ نهایی</span>
            <span>{formatToman(order.total)}</span>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-surface p-5 shadow-sm">
        <h2 className="mb-2 text-h4 text-text-primary">اطلاعات مشتری</h2>
        <p className="text-bodySm text-text-secondary">{order.customer.name}</p>
        <p className="text-bodySm text-text-secondary">{order.customer.phone}</p>
        <p className="text-bodySm text-text-secondary">{order.address.fullAddress}</p>
      </div>

      {canCancel && <CancelOrderButton orderId={order.id} cancelDeadline={order.cancelDeadline} />}

      <div className="rounded-lg bg-bg-secondary p-5 text-bodySm text-text-secondary">
        <h2 className="mb-2 text-h4 text-text-primary">مراحل بعدی</h2>
        <p>
          وضعیت سفارش شما از طریق پیامک اطلاع‌رسانی می‌شود. برای پیگیری مستقیم، می‌توانید با شعبه{" "}
          {order.branchName} تماس بگیرید.
        </p>
      </div>
    </Container>
  );
}
