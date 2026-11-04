import crypto from "crypto";
import type { Gateway } from "./types";

/**
 * درگاه آزمایشی: برای تست کامل فرایند خرید بدون پول واقعی.
 * قبل از راه‌اندازی واقعی، از «پنل ← تنظیمات ← درگاه‌ها» خاموشش کن.
 */
export const mock: Gateway = {
  id: "mock",
  title: "درگاه آزمایشی",
  note: "فقط برای تست؛ پول واقعی جابه‌جا نمی‌شه",
  enabled: (s) => s.pay_mock_enabled === "1",
  async start(order) {
    const token = crypto.randomBytes(16).toString("hex");
    return { ok: true, authority: token, url: `/pay/mock?order=${order.code}&token=${token}` };
  },
  async verify(order, _items, params) {
    if (params.status !== "OK") return { ok: false, error: "پرداخت توسط کاربر لغو شد." };
    if (!params.token || params.token !== order.payment_authority) return { ok: false, error: "توکن پرداخت نامعتبره." };
    return { ok: true, ref: "TEST-" + Date.now().toString().slice(-8) };
  },
};
