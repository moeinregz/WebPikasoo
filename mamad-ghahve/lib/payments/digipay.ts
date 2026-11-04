import { postJson, toRial, type Gateway } from "./types";

/**
 * دیجی‌پی (پرداخت کارتی / کیف پول / اعتباری بسته به نوع تیکت)
 * اطلاعات اتصال رو دیجی‌پی بعد از قرارداد می‌ده. محیط تست: https://uat.mydigipay.info
 * جریان: oauth/token → tickets/business (گرفتن redirectUrl) → بازگشت (POST) به callbackUrl → purchases/verify
 * نوع تیکت (digipay_ticket_type) رو طبق قراردادت تنظیم کن؛ برای خرید اعتباری بعد از ارسال کالا باید deliver هم صدا زده بشه.
 */
const PATHS = {
  token: "/digipay/api/oauth/token",
  ticket: "/digipay/api/tickets/business",
  verify: "/digipay/api/purchases/verify",
};
const HEADERS = { Agent: "WEB", "Digipay-Version": "2022-02-02" };

async function accessToken(s: Record<string, string>): Promise<string> {
  const basic = Buffer.from(`${s.digipay_client_id}:${s.digipay_client_secret}`).toString("base64");
  const res = await fetch(s.digipay_base_url.replace(/\/$/, "") + PATHS.token, {
    method: "POST",
    headers: { Authorization: `Basic ${basic}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "password", username: s.digipay_username, password: s.digipay_password }),
    cache: "no-store",
  });
  const j = await res.json().catch(() => null);
  if (!j?.access_token) throw new Error("digipay auth failed");
  return j.access_token;
}

export const digipay: Gateway = {
  id: "digipay",
  title: "دیجی‌پی",
  note: "پرداخت با کیف پول یا اعتبار دیجی‌پی",
  enabled: (s) => s.digipay_enabled === "1" && !!s.digipay_client_id && !!s.digipay_username,
  async start(order, _items, s, callbackUrl) {
    const base = s.digipay_base_url.replace(/\/$/, "");
    const type = s.digipay_ticket_type || "11";
    try {
      const token = await accessToken(s);
      const { json } = await postJson(
        `${base}${PATHS.ticket}?type=${encodeURIComponent(type)}`,
        { amount: toRial(order.total), cellNumber: order.phone, providerId: order.code, callbackUrl },
        { Authorization: `Bearer ${token}`, ...HEADERS }
      );
      if (json?.result?.status === 0 && json.redirectUrl) {
        return { ok: true, authority: json.ticket || order.code, url: json.redirectUrl, meta: { type } };
      }
      return { ok: false, error: json?.result?.message || "ساخت تراکنش دیجی‌پی ناموفق بود." };
    } catch {
      return { ok: false, error: "ارتباط با دیجی‌پی برقرار نشد." };
    }
  },
  async verify(order, _items, params, s) {
    if ((params.result || "").toUpperCase() !== "SUCCESS") return { ok: false, error: "پرداخت دیجی‌پی تکمیل نشد." };
    if (params.providerId && params.providerId !== order.code) return { ok: false, error: "شناسه‌ی سفارش نمی‌خونه." };
    if (params.amount && Number(params.amount) !== toRial(order.total)) return { ok: false, error: "مبلغ پرداختی با سفارش نمی‌خونه." };
    const tracking = params.trackingCode;
    if (!tracking) return { ok: false, error: "کد پیگیری دیجی‌پی دریافت نشد." };
    const base = s.digipay_base_url.replace(/\/$/, "");
    const type = params.type || s.digipay_ticket_type || "11";
    try {
      const token = await accessToken(s);
      const { json } = await postJson(
        `${base}${PATHS.verify}/${encodeURIComponent(tracking)}?type=${encodeURIComponent(type)}`,
        { providerId: order.code },
        { Authorization: `Bearer ${token}`, ...HEADERS }
      );
      if (json?.result?.status === 0) return { ok: true, ref: String(json.trackingCode || tracking), meta: { type, rrn: json.rrn } };
      return { ok: false, error: json?.result?.message || "تأیید دیجی‌پی ناموفق بود." };
    } catch {
      return { ok: false, error: "ارتباط با دیجی‌پی برای تأیید برقرار نشد." };
    }
  },
};
