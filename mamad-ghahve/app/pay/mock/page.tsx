import { notFound } from "next/navigation";
import { orderByCode } from "@/lib/orders";
import { getSetting } from "@/lib/settings";

export const metadata = { title: "درگاه آزمایشی", robots: { index: false } };

export default function MockGateway({ searchParams }: { searchParams: { order?: string; token?: string } }) {
  if (getSetting("pay_mock_enabled") !== "1") notFound();
  const o = orderByCode(searchParams.order || "");
  if (!o || o.payment_provider !== "mock") notFound();
  const action = `/api/payment/callback/mock?order=${o.code}`;
  return (
    <div className="gateway-page">
      <div className="card" style={{ maxWidth: 420, width: "100%" }}>
        <div className="alert warn" style={{ marginBottom: 14 }}>⚠️ این درگاه آزمایشیه و پول واقعی جابه‌جا نمی‌شه.</div>
        <h1 className="display" style={{ fontSize: "1.6rem" }}>پرداخت سفارش {o.code}</h1>
        <p style={{ fontSize: "1.4rem", fontWeight: 800, margin: "12px 0" }}>{o.total.toLocaleString("fa-IR")} تومان</p>
        <form method="post" action={action} className="stack">
          <input type="hidden" name="token" value={searchParams.token || ""} />
          <button className="btn block" name="status" value="OK" style={{ background: "#3f8f5a" }}>✅ پرداخت موفق</button>
          <button className="btn block danger" name="status" value="NOK">❌ انصراف از پرداخت</button>
        </form>
      </div>
    </div>
  );
}
