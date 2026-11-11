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

// ---------------------------------------------------------------------------
// FarazSMS (فراز اس ام اس) — runs on the IPPanel web service.
//   SMS_PROVIDER=farazsms (or ippanel)
//   FARAZSMS_API_KEY   the panel's «کلید دسترسی وب سرویس»
//   FARAZSMS_SENDER    the sending line from the panel, e.g. 3000505 or +983000505
// Numbers are sent in international form (+98…). Error fields differ between
// API versions (errorMessage / error_message / message), so all are read.
// ---------------------------------------------------------------------------
const IPPANEL_BASE = "https://api2.ippanel.com/api/v1";

function ippanelKey() {
  return (process.env.FARAZSMS_API_KEY || process.env.IPPANEL_API_KEY || "").trim();
}
function ippanelSender() {
  const raw = (process.env.FARAZSMS_SENDER || process.env.IPPANEL_SENDER || "").trim().replace(/[^\d+]/g, "");
  if (!raw) return "";
  if (raw.startsWith("+")) return raw;
  if (raw.startsWith("98")) return "+" + raw;
  return "+98" + raw.replace(/^0+/, "");
}
/** 09121234567 → +989121234567 */
const intl = (mobile: string) => "+98" + mobile.replace(/^0/, "");

type IppanelBody = {
  data?: { message_id?: number | string; bulk_id?: number | string; credit?: number } | null;
  errorMessage?: unknown;
  error_message?: unknown;
  message?: unknown;
};

function ippanelError(body: IppanelBody | null, status: number): string {
  const raw = body?.errorMessage ?? body?.error_message ?? body?.message;
  const msg = typeof raw === "string" ? raw : raw ? JSON.stringify(raw) : "";
  if (status === 401 || status === 403) return `کلید وب سرویس فراز اس ام اس معتبر نیست یا دسترسی نداره (${status})${msg ? `: ${msg}` : ""}`;
  return msg ? `فراز اس ام اس: ${msg}` : `فراز اس ام اس: خطای ${status}`;
}

async function ippanelFetch(path: string, init: RequestInit): Promise<{ status: number; body: IppanelBody | null }> {
  const res = await fetch(IPPANEL_BASE + path, {
    ...init,
    headers: { apikey: ippanelKey(), Accept: "application/json", "Content-Type": "application/json", ...(init.headers || {}) },
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  const body = (await res.json().catch(() => null)) as IppanelBody | null;
  return { status: res.status, body };
}

const farazsms: Provider = {
  name: "فراز اس ام اس",
  missing() {
    const m: string[] = [];
    if (!ippanelKey()) m.push("FARAZSMS_API_KEY");
    if (!ippanelSender()) m.push("FARAZSMS_SENDER");
    return m;
  },
  async send(to, text) {
    const { status, body } = await ippanelFetch("/sms/send/webservice/single", {
      method: "POST",
      body: JSON.stringify({
        sender: ippanelSender(),
        recipient: [intl(to)],
        message: text,
        description: { summary: "webpikaso", count_recipient: "1" },
      }),
    });
    const id = body?.data?.message_id ?? body?.data?.bulk_id;
    const hasError = Boolean(body?.errorMessage || body?.error_message);
    if (status >= 200 && status < 300 && id != null && !hasError) return { ok: true, id: String(id) };
    return { ok: false, error: ippanelError(body, status) };
  },
};

const PROVIDERS: Record<string, Provider> = {
  farazsms,
  ippanel: farazsms,
};

/** Account credit on the SMS panel (read-only), when the provider supports it. */
export async function smsCredit(): Promise<{ ok: true; credit: number } | { ok: false; error: string }> {
  const key = (process.env.SMS_PROVIDER || "").trim().toLowerCase();
  if (PROVIDERS[key] !== farazsms) return { ok: false, error: "پنل پیامکی وصل نیست" };
  if (!ippanelKey()) return { ok: false, error: "FARAZSMS_API_KEY تنظیم نشده" };
  try {
    const { status, body } = await ippanelFetch("/sms/accounting/credit/show", { method: "GET" });
    const credit = body?.data?.credit;
    if (status >= 200 && status < 300 && typeof credit === "number") return { ok: true, credit };
    return { ok: false, error: ippanelError(body, status) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

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
