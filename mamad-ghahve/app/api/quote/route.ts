import { NextResponse } from "next/server";
import { quote, type CartLine } from "@/lib/orders";
import { currentCustomer } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const me = currentCustomer();
  const q = quote((body.items || []) as CartLine[], { coupon: String(body.coupon || ""), usePoints: !!body.usePoints, customer: me });
  return NextResponse.json({ ...q, loggedIn: !!me, points: me?.points ?? 0 });
}
