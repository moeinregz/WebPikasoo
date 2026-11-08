import "server-only";
import { postJson, sleep, toRial, trimBase, type Gateway } from "./types";
import type { Order, OrderItem } from "../db";

/**
 * دیجی‌پی (UPG)
 * آدرس‌ها: تست https://uat.mydigipay.info — اصلی https://api.mydigipay.com  (مسیرها زیر /digipay/api)
 * جریان: oauth/token ← tickets/business?type=… (redirectUrl) ← مشتری با POST به callbackUrl برمی‌گرده
 *        (result, amount, providerId, trackingCode, type) ← purchases/verify?type=… ← (برای اعتباری/BNPL بعد از ارسال: purchases/deliver)
 * نوع تیکت (type): 0 = درگاه کارت، 11 = کیف پول (پیش‌فرض)، 5 = اعتباری، 13 = BNPL (اقساطی)، 24 = کارت اعتباری
 * مبلغ‌ها به ریال. providerId باید برای هر تراکنش یکتا باشه (کد سفارش).
 */
const PATHS = {
  token: "/digipay/api/oauth/token",
  ticket: "/digipay/api/tickets/business",
  verify: "/digipay/api/purchases/verify",
  deliver: "/digipay/api/purchases/deliver",
};
const HEADERS = { Agent: "WEB", "Digipay-Version": "2022-02-02" };
export const DIGIPAY_DELIVER_TYPES = ["5", "13"];

type S = Record<string, string>;
let cached: { key: string; token: string; until: number } | null = null;

async function accessToken(s: S): Promise<string> {
  const key = `${s.digipay_base_url}|${s.digipay_client_id}|${s.digipay_username}`;
  if (cached && cached.key === key && cached.until > Date.now()) return cached.token;
  const basic = Buffer.from(`${s.digipay_client_id}:${s.digipay_client_secret}`).toString("base64");
  // دیجی‌پی اطلاعات ورود رو به‌صورت multipart/form-data می‌خواد
  const form = new FormData();
  form.set("username", s.digipay_username);
  form.set("password", s.digipay_password);
  form.set("grant_type", "password");
  const res = await fetch(trimBase(s.digipay_base_url) + PATHS.token, {
    method: "POST",
    headers: { Authorization: `Basic ${basic}`, Accept: "application/json" },
    body: form,
    cache: "no-store",
  });
  const j: any = await res.json().catch(() => null);
  if (!j?.access_token) throw new Error(j?.error_description || j?.result?.message || `ورود به دیجی‌پی ناموفق بود (HTTP ${res.status}).`);
  const ttl = Math.max(60, Number(j.expires_in || 3600) - 60) * 1000;
  cached = { key, token: j.access_token, until: Date.now() + ttl };
  return j.access_token;
}

const auth = async (s: S) => ({ Authorization: `Bearer ${await accessToken(s)}`, ...HEADERS });

function basket(order: Order, items: OrderItem[]) {
  return {
    basketId: order.code,
    items: items.map((it) => ({
      sellerId: 1,
      supplierId: 1,
      productCode: String(it.product_id ?? it.id),
      brand: "ممد قهوه",
      productType: 1,
      count: it.qty,
      categoryId: "1",
    })),
  };
}

export const digipay: Gateway = {
  id: "digipay",
  title: "دیجی‌پی",
  note: "پرداخت با کیف پول، کارت یا اعتبار دیجی‌پی",
  enabled: (s) => s.digipay_enabled === "1" && !!s.digipay_client_id && !!s.digipay_username,

  async start(order, items, s, callbackUrl) {
    const type = (s.digipay_ticket_type || "11").trim();
    try {
      const body: Record<string, unknown> = {
        amount: toRial(order.total),
        cellNumber: order.phone,
        providerId: order.code,
        callbackUrl,
      };
      if (DIGIPAY_DELIVER_TYPES.includes(type)) body.basketDetailsDto = basket(order, items);
      const { json, status } = await postJson(`${trimBase(s.digipay_base_url)}${PATHS.ticket}?type=${encodeURIComponent(type)}`, body, await auth(s));
      if (json?.result?.status === 0 && json.redirectUrl) {
        return { ok: true, authority: json.ticket || order.code, url: json.redirectUrl, meta: { type } };
      }
      return { ok: false, error: json?.result?.message || `ساخت تراکنش دیجی‌پی ناموفق بود (HTTP ${status}).` };
    } catch (e) {
      return { ok: false, error: (e as Error).message || "ارتباط با دیجی‌پی برقرار نشد." };
    }
  },

  async verify(order, _items, params, s) {
    if ((params.result || params.status || "").toUpperCase() !== "SUCCESS") return { ok: false, error: "پرداخت دیجی‌پی تکمیل نشد یا لغو شد." };
    if (params.providerId && params.providerId !== order.code) return { ok: false, error: "شناسه‌ی سفارش نمی‌خونه." };
    if (params.amount && Number(params.amount) > 0 && Number(params.amount) !== toRial(order.total)) return { ok: false, error: "مبلغ پرداختی با سفارش نمی‌خونه." };
    const tracking = params.trackingCode || params.tracking_code;
    if (!tracking) return { ok: false, error: "کد پیگیری دیجی‌پی دریافت نشد." };
    const type = (params.type || s.digipay_ticket_type || "11").trim();
    const url = `${trimBase(s.digipay_base_url)}${PATHS.verify}?type=${encodeURIComponent(type)}`;
    try {
      // کد 9011 یعنی «هنوز آماده نیست» → چند ثانیه صبر و تلاش دوباره (حداکثر ۴ بار)
      for (let attempt = 1; attempt <= 4; attempt++) {
        const { json, status } = await postJson(url, { trackingCode: tracking, providerId: order.code }, await auth(s));
        const st = json?.result?.status;
        if (st === 0) {
          if (json.amount && Number(json.amount) !== toRial(order.total)) return { ok: false, error: "مبلغ تأییدشده با سفارش نمی‌خونه." };
          return { ok: true, ref: String(json.trackingCode || tracking), meta: { type, rrn: json.rrn, card: json.maskedPan, gateway: json.paymentGateway } };
        }
        if (st === 9011 && attempt < 4) {
          await sleep(5000);
          continue;
        }
        return { ok: false, error: json?.result?.message || `تأیید دیجی‌پی ناموفق بود (HTTP ${status}).` };
      }
      return { ok: false, error: "تأیید دیجی‌پی بعد از چند تلاش انجام نشد." };
    } catch (e) {
      return { ok: false, error: (e as Error).message || "ارتباط با دیجی‌پی برای تأیید برقرار نشد." };
    }
  },

  async test(s) {
    try {
      cached = null;
      await accessToken(s);
      return { ok: true, message: `ورود به دیجی‌پی موفق بود (نوع تیکت: ${s.digipay_ticket_type || "11"}).` };
    } catch (e) {
      return { ok: false, message: (e as Error).message };
    }
  },
};

/**
 * تأیید تحویل کالا — برای خرید اعتباری (۵) و BNPL (۱۳) اجباریه؛ بعد از ارسال سفارش صدا زده می‌شه.
 */
export async function digipayDeliver(order: Order, items: OrderItem[], s: S): Promise<{ ok: boolean; message: string }> {
  let type = s.digipay_ticket_type || "11";
  try {
    const meta = JSON.parse(order.payment_meta || "{}");
    if (meta?.type) type = String(meta.type);
  } catch {}
  if (!DIGIPAY_DELIVER_TYPES.includes(type)) return { ok: true, message: "" };
  try {
    const { json, status } = await postJson(
      `${trimBase(s.digipay_base_url)}${PATHS.deliver}?type=${encodeURIComponent(type)}`,
      {
        deliveryDate: Date.now(),
        invoiceNumber: order.code,
        trackingCode: order.payment_ref,
        products: items.map((it) => it.name),
      },
      await auth(s)
    );
    if (json?.result?.status === 0) return { ok: true, message: "تحویل سفارش به دیجی‌پی اعلام شد." };
    return { ok: false, message: json?.result?.message || `اعلام تحویل به دیجی‌پی ناموفق بود (HTTP ${status}).` };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}
