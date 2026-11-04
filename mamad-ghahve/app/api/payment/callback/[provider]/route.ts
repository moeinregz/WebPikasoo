import { NextResponse } from "next/server";
import { gateway } from "@/lib/payments";
import { markFailed, markPaid, orderByCode, orderItems } from "@/lib/orders";
import { getSettings, siteUrl } from "@/lib/settings";

/** بازگشت از درگاه (زرین‌پال با GET، اسنپ‌پی و دیجی‌پی با POST) */
async function handle(req: Request, provider: string) {
  const url = new URL(req.url);
  const params: Record<string, string> = {};
  url.searchParams.forEach((v, k) => (params[k] = v));
  if (req.method === "POST") {
    const ct = req.headers.get("content-type") || "";
    try {
      if (ct.includes("application/json")) {
        const j = await req.json();
        for (const [k, v] of Object.entries(j || {})) params[k] = String(v);
      } else {
        const fd = await req.formData();
        fd.forEach((v, k) => (params[k] = String(v)));
      }
    } catch {}
  }

  const code = params.order || params.transactionId || params.providerId || "";
  const order = orderByCode(code);
  const base = siteUrl();
  if (!order) return NextResponse.redirect(`${base}/`, 303);
  const go = (msg?: string) => NextResponse.redirect(`${base}/order/${order.code}${msg ? "?msg=" + encodeURIComponent(msg) : ""}`, 303);

  if (order.status !== "pending") return go(); // قبلاً پردازش شده
  const gw = gateway(provider);
  if (!gw || order.payment_provider !== gw.id) return go("درگاه نامعتبر");

  const r = await gw.verify(order, orderItems(order.id), params, getSettings());
  if (r.ok) {
    markPaid(order.id, r.ref, r.meta);
    return go();
  }
  markFailed(order.id, r.error);
  return go(r.error);
}

export async function GET(req: Request, { params }: { params: { provider: string } }) {
  return handle(req, params.provider);
}
export async function POST(req: Request, { params }: { params: { provider: string } }) {
  return handle(req, params.provider);
}
