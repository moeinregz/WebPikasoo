import { intlMobile, postJson, toRial, type Gateway } from "./types";

/**
 * اسنپ‌پی (خرید اقساطی / پرداخت در ۴ قسط)
 * اطلاعات اتصال (base url، client id/secret، username/password) رو اسنپ‌پی بعد از عقد قرارداد می‌ده.
 * جریان: token → payment/token (گرفتن paymentToken و آدرس صفحه) → بازگشت به returnURL → verify → settle
 * اگه مستندات نسخه‌ای که بهت دادن فرق داشت، فقط مسیرهای PATHS رو اصلاح کن.
 */
const PATHS = {
  token: "/api/online/v1/oauth/token",
  eligible: "/api/online/offer/v1/eligible",
  paymentToken: "/api/online/payment/v1/token",
  verify: "/api/online/payment/v1/verify",
  settle: "/api/online/payment/v1/settle",
  revert: "/api/online/payment/v1/revert",
};

async function accessToken(s: Record<string, string>): Promise<string> {
  const basic = Buffer.from(`${s.snappay_client_id}:${s.snappay_client_secret}`).toString("base64");
  const body = new URLSearchParams({
    grant_type: "password",
    scope: "online-merchant",
    username: s.snappay_username,
    password: s.snappay_password,
  });
  const res = await fetch(s.snappay_base_url.replace(/\/$/, "") + PATHS.token, {
    method: "POST",
    headers: { Authorization: `Basic ${basic}`, "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });
  const j = await res.json().catch(() => null);
  if (!j?.access_token) throw new Error("snappay auth failed");
  return j.access_token;
}

export const snappay: Gateway = {
  id: "snappay",
  title: "اسنپ‌پی (۴ قسط بدون کارمزد)",
  note: "الان بخر، بعداً قسطی پرداخت کن",
  enabled: (s) => s.snappay_enabled === "1" && !!s.snappay_base_url && !!s.snappay_client_id && !!s.snappay_username,
  async start(order, items, s, callbackUrl) {
    const base = s.snappay_base_url.replace(/\/$/, "");
    try {
      const token = await accessToken(s);
      const auth = { Authorization: `Bearer ${token}` };
      const amount = toRial(order.total);

      // بررسی اینکه این مبلغ برای اسنپ‌پی مجازه
      const el = await fetch(`${base}${PATHS.eligible}?amount=${amount}`, { headers: auth, cache: "no-store" }).then((r) => r.json()).catch(() => null);
      if (el && el.successful === false) return { ok: false, error: el.errorData?.message || "این مبلغ برای اسنپ‌پی مجاز نیست." };
      if (el?.response && el.response.eligible === false) return { ok: false, error: el.response.description || "این سفارش شرایط پرداخت اقساطی رو نداره." };

      const { json } = await postJson(
        base + PATHS.paymentToken,
        {
          amount,
          discountAmount: toRial(order.discount + order.points_discount),
          externalSourceAmount: 0,
          mobile: intlMobile(order.phone),
          paymentMethodTypeDto: "INSTALLMENT",
          returnURL: callbackUrl,
          transactionId: order.code,
          cartList: [
            {
              cartId: 1,
              totalAmount: toRial(order.subtotal + order.shipping),
              shippingAmount: toRial(order.shipping),
              isShipmentIncluded: true,
              taxAmount: 0,
              isTaxIncluded: true,
              cartItems: items.map((it) => ({
                id: it.product_id ?? it.id,
                name: it.name + (it.option ? ` (${it.option})` : ""),
                amount: toRial(it.price),
                count: it.qty,
                category: "قهوه",
                commissionType: 100,
              })),
            },
          ],
        },
        auth
      );
      const r = json?.response;
      if (json?.successful && r?.paymentPageUrl && r?.paymentToken) {
        return { ok: true, authority: r.paymentToken, url: r.paymentPageUrl };
      }
      return { ok: false, error: json?.errorData?.message || "ساخت تراکنش اسنپ‌پی ناموفق بود." };
    } catch {
      return { ok: false, error: "ارتباط با اسنپ‌پی برقرار نشد." };
    }
  },
  async verify(order, _items, params, s) {
    // اسنپ‌پی با state=OK برمی‌گرده
    const state = (params.state || params.status || "").toUpperCase();
    if (state && state !== "OK") return { ok: false, error: "پرداخت اقساطی تکمیل نشد." };
    if (params.transactionId && params.transactionId !== order.code) return { ok: false, error: "شناسه‌ی تراکنش با سفارش نمی‌خونه." };
    const base = s.snappay_base_url.replace(/\/$/, "");
    try {
      const token = await accessToken(s);
      const auth = { Authorization: `Bearer ${token}` };
      const v = await postJson(base + PATHS.verify, { paymentToken: order.payment_authority }, auth);
      if (!v.json?.successful) return { ok: false, error: v.json?.errorData?.message || "تأیید اسنپ‌پی ناموفق بود." };
      const st = await postJson(base + PATHS.settle, { paymentToken: order.payment_authority }, auth);
      if (!st.json?.successful) {
        await postJson(base + PATHS.revert, { paymentToken: order.payment_authority }, auth).catch(() => null);
        return { ok: false, error: st.json?.errorData?.message || "تسویه‌ی اسنپ‌پی ناموفق بود و تراکنش برگشت خورد." };
      }
      return { ok: true, ref: String(st.json.response?.transactionId || v.json.response?.transactionId || order.code) };
    } catch {
      return { ok: false, error: "ارتباط با اسنپ‌پی برای تأیید برقرار نشد." };
    }
  },
};
