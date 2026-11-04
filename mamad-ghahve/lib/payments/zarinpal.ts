import { postJson, toRial, type Gateway } from "./types";

/**
 * زرین‌پال (API نسخه‌ی ۴)
 * مستندات: https://www.zarinpal.com/docs/paymentGateway/
 * فقط «مرچنت کد» لازمه. حالت sandbox برای تست با مرچنت آزمایشی.
 */
function host(s: Record<string, string>) {
  return s.zarinpal_sandbox === "1" ? "https://sandbox.zarinpal.com" : "https://payment.zarinpal.com";
}

export const zarinpal: Gateway = {
  id: "zarinpal",
  title: "پرداخت آنلاین (کارت‌های شتاب)",
  note: "درگاه زرین‌پال",
  enabled: (s) => s.zarinpal_enabled === "1" && !!s.zarinpal_merchant,
  async start(order, _items, s, callbackUrl) {
    try {
      const { json } = await postJson(`${host(s)}/pg/v4/payment/request.json`, {
        merchant_id: s.zarinpal_merchant,
        amount: toRial(order.total),
        currency: "IRR",
        callback_url: callbackUrl,
        description: `سفارش ${order.code} - ممد قهوه`,
        metadata: { mobile: order.phone, order_id: order.code },
      });
      const data = json?.data;
      if (data?.code === 100 && data.authority) {
        return { ok: true, authority: data.authority, url: `${host(s)}/pg/StartPay/${data.authority}` };
      }
      return { ok: false, error: `خطای زرین‌پال: ${JSON.stringify(json?.errors || json)}` };
    } catch (e) {
      return { ok: false, error: "ارتباط با زرین‌پال برقرار نشد." };
    }
  },
  async verify(order, _items, params, s) {
    if (params.Status !== "OK") return { ok: false, error: "پرداخت لغو شد یا ناموفق بود." };
    if (params.Authority !== order.payment_authority) return { ok: false, error: "شناسه‌ی پرداخت با سفارش نمی‌خونه." };
    try {
      const { json } = await postJson(`${host(s)}/pg/v4/payment/verify.json`, {
        merchant_id: s.zarinpal_merchant,
        amount: toRial(order.total),
        authority: order.payment_authority,
      });
      const data = json?.data;
      // 100 = موفق، 101 = قبلاً تأیید شده
      if (data && (data.code === 100 || data.code === 101)) return { ok: true, ref: String(data.ref_id), meta: { card: data.card_pan } };
      return { ok: false, error: `تأیید پرداخت ناموفق بود (${JSON.stringify(json?.errors || data)})` };
    } catch {
      return { ok: false, error: "ارتباط با زرین‌پال برای تأیید برقرار نشد." };
    }
  },
};
