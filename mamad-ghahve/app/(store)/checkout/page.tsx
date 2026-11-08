import { currentCustomer } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { enabledGateways } from "@/lib/payments";
import CheckoutForm from "./CheckoutForm";

export const metadata = { title: "تکمیل خرید" };

export default function CheckoutPage() {
  const me = currentCustomer();
  const gws = enabledGateways(getSettings());
  return (
    <div className="container">
      <h1 className="page-title">تکمیل خرید</h1>
      <CheckoutForm
        gateways={gws}
        me={me ? { name: me.name, phone: me.phone, address: me.address, city: me.city, postal_code: me.postal_code, points: me.points } : null}
      />
    </div>
  );
}
