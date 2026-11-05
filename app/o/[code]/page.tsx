import type { Metadata } from "next";
import OfferLanding from "../OfferLanding";
import { offerTrades } from "../trades";
import { getSmsRef, touchSmsRef } from "@/lib/db";

// Personal link from an SMS: greets the business by name and opens on its trade.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "سایت اختصاصی شما آماده‌ست — وب پیکاسو",
  description: "دموی زنده‌ی سایت کسب‌وکارت رو ببین و با مشاوره‌ی رایگان سفارش بده.",
  robots: { index: false, follow: false },
};

export default async function PersonalOfferPage({ params }: { params: { code: string } }) {
  const trades = offerTrades();
  const ref = await getSmsRef(params.code).catch(() => undefined);
  if (ref) await touchSmsRef(ref.code).catch(() => {});
  const initial = trades.find((t) => t.id === ref?.trade_id)?.id ?? trades[0].id;
  return <OfferLanding trades={trades} initialTrade={initial} name={ref?.name} code={ref?.code} />;
}
