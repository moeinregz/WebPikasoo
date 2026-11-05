import type { Metadata } from "next";
import OfferLanding from "./OfferLanding";
import { offerTrades } from "./trades";

export const metadata: Metadata = {
  title: "سایت اختصاصی کسب‌وکار شما — وب پیکاسو",
  description: "دموی زنده‌ی سایت مخصوص صنف خودت رو ببین و با مشاوره‌ی رایگان سفارش بده.",
  robots: { index: false, follow: true },
};

export default function OfferPage({ searchParams }: { searchParams?: { t?: string } }) {
  const trades = offerTrades();
  const initial = trades.find((t) => t.id === searchParams?.t)?.id ?? trades[0].id;
  return <OfferLanding trades={trades} initialTrade={initial} />;
}
