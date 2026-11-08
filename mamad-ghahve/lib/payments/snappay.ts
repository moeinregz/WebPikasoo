import { postJson, toRial, trimBase, type Gateway } from "./types";

/**
 * اسنپ‌پی (خرید اقساطی) — API آنلاین مرچنت
 *
 * جریان: oauth/token ← offer/eligible ← payment/token (گرفتن paymentToken و paymentPageUrl)
 *        ← مشتری با POST به returnURL برمی‌گرده (state, transactionId, amount) ← verify ← settle
 * پاسخ‌ها: { successful: boolean, response: {...}, errorData: { errorCode, message } }
 * مبلغ‌ها به ریال. قانون مهم: جمع cartList (totalAmount) − discountAmount − externalSourceAmount = amount
 *
 * اطلاعات اتصال (آدرس API، client id/secret، username/password) رو اسنپ‌پی بعد از قرارداد می‌ده
 * و IP سرور شما باید پیش اسنپ‌پی ثبت (whitelist) بشه. اگه مستندات نسخه‌ی شما فرق داشت، فقط PATHS رو اصلاح کن.
 */
const PATHS = {
  token: "/api/online/v1/oauth/token",
  eligible: "/api/online/offer/v1/eligible",
  paymentToken: "/api/online/payment/v1/token",
  verify: "/api/online/payment/v1/verify",
  settle: "/api/online/payment/v1/settle",
  revert: "/api/online/payment/v1/revert",
  status: "/api/online/payment/v1/status",
};

type S = Record<string, string>;

/** کد سفارش ما MG12345678 است؛ اسنپ‌پی شناسه‌ی ۵ تا ۱۰ رقمی می‌خواد، پس فقط بخش عددی رو می‌فرستیم */
export const snappTxId = (orderCode: string) => orderCode.replace(/\D/g, "");

let cached: { key: string; token: string; until: number } | null = null;

async function accessToken(s: S): Promise<string> {
  const key = `${s.snappay_base_url}|${s.snappay_client_id}|${s.snappay_username}`;
  if (cached && cached.key === key && cached.until > Date.now()) return cached.token;
  const basic = Buffer.from(`${s.snappay_client_id}:${s.snappay_client_secret}`).toString("base64");
  const res = await fetch(trimBase(s.snappay_base_url) + PATHS.token, {
    method: "POST",
    headers: { Authorization: `Basic ${basic}`, "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: new URLSearchParams({ grant_type: "password", scope: "online-merchant", username: s.snappay_username, password: s.snappay_password }),
    cache: "no-store",
  });
  const j: any = await res.json().catch(() => null);
  if (res.status === 403) throw new Error("دسترسی رد شد؛ احتمالاً IP سرور هنوز پیش اسنپ‌پی ثبت نشده.");
  if (!j?.access_token) throw new Error(j?.error_description || j?.errorData?.message || `ورود به اسنپ‌پی ناموفق بود (HTTP ${res.status}).`);
  const ttl = Math.max(60, Number(j.expires_in || 3600) - 60) * 1000;
  cached = { key, token: j.access_token, until: Date.now() + ttl };
  return j.access_token;
}

const errMsg = (j: any, fallback: string) => j?.errorData?.message || j?.message || fallback;

async function call(s: S, path: string, body: unknown) {
  const token = await accessToken(s);
  let r = await postJson(trimBase(s.snappay_base_url) + path, body, { Authorization: `Bearer ${token}` });
  if (r.status === 401) {
    cached = null; // توکن منقضی شده؛ یک بار دوباره
    const t2 = await accessToken(s);
    r = await postJson(trimBase(s.snappay_base_url) + path, body, { Authorization: `Bearer ${t2}` });
  }
  return r;
}

async function status(s: S, paymentToken: string): Promise<string | null> {
  try {
    const token = await accessToken(s);
    const res = await fetch(`${trimBase(s.snappay_base_url)}${PATHS.status}?paymentToken=${encodeURIComponent(paymentToken)}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      cache: "no-store",
    });
    const j: any = await res.json().catch(() => null);
    return j?.successful ? String(j.response?.status || "") : null;
  } catch {
    return null;
  }
}

export const snappay: Gateway = {
  id: "snappay",
  title: "اسنپ‌پی (۴ قسط بدون کارمزد)",
  note: "الان بخر، بعداً قسطی پرداخت کن",
  enabled: (s) => s.snappay_enabled === "1" && !!s.snappay_base_url && !!s.snappay_client_id && !!s.snappay_username,

  async start(order, items, s, callbackUrl) {
    const base = trimBase(s.snappay_base_url);
    try {
      const token = await accessToken(s);
      const amount = toRial(order.total);

      // آیا این مبلغ برای اسنپ‌پی مجازه؟
      const el: any = await fetch(`${base}${PATHS.eligible}?amount=${amount}`, { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }, cache: "no-store" })
        .then((r) => r.json())
        .catch(() => null);
      if (el && el.successful === false) return { ok: false, error: errMsg(el, "این مبلغ برای اسنپ‌پی مجاز نیست.") };
      if (el?.response && el.response.eligible === false)
        return { ok: false, error: el.response.title_message || el.response.titleMessage || el.response.description || "این سفارش شرایط پرداخت اقساطی رو نداره." };

      const shipping = toRial(order.shipping);
      const cartItems = items.map((it) => ({
        id: it.product_id ?? it.id,
        name: (it.name + (it.option ? ` - ${it.option}` : "")).slice(0, 120),
        count: it.qty,
        amount: toRial(it.price), // قیمت واحد
        category: "قهوه",
        commissionType: 100,
      }));
      const itemsTotal = cartItems.reduce((a, c) => a + c.amount * c.count, 0);
      const totalAmount = itemsTotal + shipping;
      const discountAmount = totalAmount - amount; // تخفیف کد + امتیاز باشگاه

      const r = await call(s, PATHS.paymentToken, {
        amount,
        cartList: [
          {
            cartId: 1,
            cartItems,
            isShipmentIncluded: false,
            shippingAmount: shipping,
            isTaxIncluded: true,
            taxAmount: 0,
            totalAmount,
          },
        ],
        discountAmount: Math.max(0, discountAmount),
        externalSourceAmount: 0,
        mobile: order.phone, // 09xxxxxxxxx
        paymentMethodTypeDto: "INSTALLMENT",
        returnURL: callbackUrl,
        transactionId: snappTxId(order.code),
      });
      const resp = r.json?.response;
      if (r.json?.successful && resp?.paymentPageUrl && resp?.paymentToken) {
        return { ok: true, authority: resp.paymentToken, url: resp.paymentPageUrl };
      }
      return { ok: false, error: errMsg(r.json, `ساخت تراکنش اسنپ‌پی ناموفق بود (HTTP ${r.status}).`) };
    } catch (e) {
      return { ok: false, error: (e as Error).message || "ارتباط با اسنپ‌پی برقرار نشد." };
    }
  },

  async verify(order, _items, params, s) {
    const state = (params.state || "").toUpperCase();
    if (state !== "OK") return { ok: false, error: "پرداخت اقساطی تکمیل نشد یا لغو شد." };
    if (params.transactionId && params.transactionId !== snappTxId(order.code)) return { ok: false, error: "شناسه‌ی تراکنش با سفارش نمی‌خونه." };
    if (params.amount && Number(params.amount) !== toRial(order.total)) return { ok: false, error: "مبلغ برگشتی با سفارش نمی‌خونه." };
    const pt = order.payment_authority;
    try {
      // verify (اگه جواب نیومد، وضعیت رو می‌پرسیم)
      const v = await call(s, PATHS.verify, { paymentToken: pt }).catch(() => null);
      if (!v?.json?.successful) {
        const st = await status(s, pt);
        if (st !== "VERIFY" && st !== "SETTLE") return { ok: false, error: errMsg(v?.json, "تأیید اسنپ‌پی ناموفق بود.") };
      }
      // settle (اجباری)
      const st1 = await call(s, PATHS.settle, { paymentToken: pt }).catch(() => null);
      if (!st1?.json?.successful) {
        const st = await status(s, pt);
        if (st !== "SETTLE") {
          await call(s, PATHS.revert, { paymentToken: pt }).catch(() => null);
          return { ok: false, error: errMsg(st1?.json, "تسویه‌ی اسنپ‌پی ناموفق بود و تراکنش برگشت خورد.") };
        }
      }
      return { ok: true, ref: String(st1?.json?.response?.transactionId || params.transactionId || pt) };
    } catch (e) {
      return { ok: false, error: (e as Error).message || "ارتباط با اسنپ‌پی برای تأیید برقرار نشد." };
    }
  },

  async test(s) {
    try {
      cached = null;
      const token = await accessToken(s);
      const el: any = await fetch(`${trimBase(s.snappay_base_url)}${PATHS.eligible}?amount=${toRial(1_000_000)}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        cache: "no-store",
      })
        .then((r) => r.json())
        .catch(() => null);
      if (el?.successful) return { ok: true, message: `ورود موفق بود. خرید ۱ میلیونی ${el.response?.eligible ? "قابل پرداخت با اسنپ‌پیه" : "فعلاً واجد شرایط نیست"}.` };
      return { ok: true, message: "ورود موفق بود (پاسخ eligible دریافت نشد)." };
    } catch (e) {
      return { ok: false, message: (e as Error).message };
    }
  },
};
