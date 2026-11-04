import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createOrder, markPaid, orderItems, quote, setPaymentAuthority, type CartLine } from "@/lib/orders";
import { currentCustomer } from "@/lib/auth";
import { getSettings, siteUrl } from "@/lib/settings";
import { gateway } from "@/lib/payments";
import { normalizePhone, toEnDigits } from "@/lib/format";
import { db } from "@/lib/db";

const clean = (v: unknown, max = 300) => String(v ?? "").trim().slice(0, max);

function rememberOrder(code: string) {
  const prev = (cookies().get("mg_orders")?.value || "").split(",").filter(Boolean);
  const next = [code, ...prev.filter((c) => c !== code)].slice(0, 20).join(",");
  cookies().set("mg_orders", next, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 180 });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "درخواست نامعتبر" }, { status: 400 });

  const info = {
    name: clean(body.info?.name, 80),
    phone: normalizePhone(clean(body.info?.phone, 20)) || "",
    city: clean(body.info?.city, 60),
    address: clean(body.info?.address, 400),
    postal_code: toEnDigits(clean(body.info?.postal_code, 12)).replace(/\D/g, ""),
    note: clean(body.info?.note, 300),
  };
  if (info.name.length < 3) return NextResponse.json({ error: "نام گیرنده رو کامل بنویس." }, { status: 400 });
  if (!info.phone) return NextResponse.json({ error: "شماره موبایل درست نیست (مثلاً 09121234567)." }, { status: 400 });
  if (info.address.length < 10 || !info.city) return NextResponse.json({ error: "شهر و آدرس کامل رو وارد کن." }, { status: 400 });

  const me = currentCustomer();
  const q = quote((body.items || []) as CartLine[], { coupon: clean(body.coupon, 40), usePoints: !!body.usePoints, customer: me });
  if (!q.lines.length) return NextResponse.json({ error: "سبد خرید خالیه یا محصولاتش ناموجود شدن." }, { status: 400 });
  if (body.coupon && q.couponError) return NextResponse.json({ error: q.couponError }, { status: 400 });

  const s = getSettings();
  // اگه کل مبلغ با امتیاز/کد تخفیف صفر شد، نیازی به درگاه نیست
  if (q.total === 0) {
    const order = createOrder(q, info, me, "points");
    markPaid(order.id, "FREE-" + order.code);
    rememberOrder(order.code);
    return NextResponse.json({ url: `/order/${order.code}` });
  }

  const gw = gateway(String(body.gateway || ""));
  if (!gw || !gw.enabled(s)) return NextResponse.json({ error: "روش پرداخت انتخاب‌شده فعال نیست." }, { status: 400 });

  const order = createOrder(q, info, me, gw.id);
  rememberOrder(order.code);
  const callback = `${siteUrl()}/api/payment/callback/${gw.id}?order=${order.code}`;
  const r = await gw.start(order, orderItems(order.id), s, callback);
  if (!r.ok) {
    // سفارش رو ناموفق ثبت کن تا امتیاز رزروشده برگرده
    const { markFailed } = await import("@/lib/orders");
    markFailed(order.id, r.error);
    return NextResponse.json({ error: r.error }, { status: 502 });
  }
  setPaymentAuthority(order.id, r.authority, r.meta);
  db().prepare("UPDATE orders SET payment_provider = ? WHERE id = ?").run(gw.id, order.id);
  return NextResponse.json({ url: r.url });
}
