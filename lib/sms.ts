// Server-only: one place that talks to the SMS provider.
//
// The provider is chosen with SMS_PROVIDER (+ its key/sender env vars). Until
// one is configured every send returns a clear «not connected» error, so the
// panel, test button and logs all work the same before and after.
//
// To add a provider: write a `send(to, text)` below and register it in PROVIDERS.

import { toMobile } from "./smsText";

export type SmsSendResult = { ok: true; id?: string } | { ok: false; error: string };

type Provider = {
  name: string;
  /** missing env vars, if any */
  missing(): string[];
  send(to: string, text: string): Promise<SmsSendResult>;
};

const PROVIDERS: Record<string, Provider> = {};

export function smsProvider(): { name: string | null; ready: boolean; missing: string[] } {
  const key = (process.env.SMS_PROVIDER || "").trim().toLowerCase();
  const p = PROVIDERS[key];
  if (!p) return { name: key || null, ready: false, missing: ["SMS_PROVIDER"] };
  const missing = p.missing();
  return { name: p.name, ready: missing.length === 0, missing };
}

export async function sendSms(to: string, text: string): Promise<SmsSendResult> {
  const mobile = toMobile(to);
  if (!mobile) return { ok: false, error: "شماره موبایل معتبر نیست" };
  const key = (process.env.SMS_PROVIDER || "").trim().toLowerCase();
  const p = PROVIDERS[key];
  if (!p) return { ok: false, error: "پنل پیامکی هنوز وصل نشده (SMS_PROVIDER)" };
  const missing = p.missing();
  if (missing.length) return { ok: false, error: `تنظیمات پنل پیامکی ناقصه: ${missing.join("، ")}` };
  try {
    return await p.send(mobile, text);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
