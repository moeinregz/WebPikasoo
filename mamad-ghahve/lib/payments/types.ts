import type { Order, OrderItem } from "../db";
import type { Settings } from "../settings";

export type StartResult = { ok: true; url: string; authority: string; meta?: unknown } | { ok: false; error: string };
export type VerifyResult = { ok: true; ref: string; meta?: unknown } | { ok: false; error: string };

export interface Gateway {
  id: string;
  title: string;
  note: string;
  enabled(s: Settings): boolean;
  /** ساخت تراکنش و گرفتن آدرس صفحه‌ی پرداخت */
  start(order: Order, items: OrderItem[], s: Settings, callbackUrl: string): Promise<StartResult>;
  /** بعد از برگشت مشتری از درگاه: تأیید نهایی پرداخت */
  verify(order: Order, items: OrderItem[], params: Record<string, string>, s: Settings): Promise<VerifyResult>;
}

/** همه‌ی درگاه‌های ایرانی مبلغ رو به ریال می‌گیرن */
export const toRial = (toman: number) => Math.round(toman) * 10;

export async function postJson(url: string, body: unknown, headers: Record<string, string> = {}): Promise<{ status: number; json: any }> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json", ...headers },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  let json: any = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }
  return { status: res.status, json };
}

export function intlMobile(phone: string): string {
  // 0912xxxxxxx -> +98912xxxxxxx
  return phone.startsWith("0") ? "+98" + phone.slice(1) : phone;
}
