import { NextRequest, NextResponse } from "next/server";
import { toEnglishDigits } from "@/lib/auth";
import { createSiteRequest, getPrivateSiteByToken, type SiteRequestKind } from "@/lib/db";
import { allowAndCooldown } from "@/lib/redis";
import type { FeatureId } from "@/lib/siteTemplates/features";

// Public endpoint the sites' add-on posts to (order, table booking, clinic
// appointment, call-back request). The site is identified by its secret
// preview token and must have the matching feature switched on.
//
// The add-on sends the body as text/plain (a "simple" cross-origin request),
// so a site downloaded onto the customer's own hosting can still reach us
// without a CORS preflight; OPTIONS is answered anyway.
export const dynamic = "force-dynamic";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

const json = (body: Record<string, unknown>, status = 200) =>
  NextResponse.json(body, { status, headers: { ...CORS, "Cache-Control": "no-store" } });
const fail = (message: string, status = 400) => json({ ok: false, message }, status);

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

const KIND_FEATURE: Record<string, FeatureId> = {
  order: "order",
  reserve: "reserve",
  appointment: "appointment",
  callback: "callback",
};

// eslint-disable-next-line no-control-regex
const CONTROL = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\u2028\u2029]/g;
const str = (v: unknown, max: number) =>
  typeof v === "string" ? v.replace(CONTROL, "").replace(/[ \t]+/g, " ").trim().slice(0, max) : "";
const isDate = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(`${v}T00:00:00Z`));
const isTime = (v: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(v);

/** Today in Iran (UTC+3:30, no DST since 2022) as YYYY-MM-DD, minus one day of slack. */
function earliestDate(): string {
  const d = new Date(Date.now() + (3.5 - 24) * 3600 * 1000);
  return d.toISOString().slice(0, 10);
}

export async function POST(request: NextRequest, { params }: { params: { token: string } }) {
  const token = params.token;
  if (!/^[A-Za-z0-9_-]{8,64}$/.test(token)) return fail("سایت پیدا نشد.", 404);

  const raw = await request.text();
  if (raw.length > 24_000) return fail("درخواست خیلی بزرگه.", 413);
  let body: Record<string, unknown>;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("shape");
    body = parsed as Record<string, unknown>;
  } catch {
    return fail("درخواست معتبر نیست.");
  }

  // Bots fill the hidden field; pretend it worked.
  if (typeof body.website === "string" && body.website.trim()) return json({ ok: true, code: 0 });

  const site = await getPrivateSiteByToken(token);
  if (!site) return fail("سایت پیدا نشد.", 404);

  const kind = typeof body.kind === "string" ? body.kind : "";
  const feature = KIND_FEATURE[kind];
  if (!feature || !site.features?.includes(feature)) return fail("این قابلیت برای این سایت فعال نیست.", 403);

  const ip = (request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown").split(",")[0].trim();
  if (!(await allowAndCooldown(`site-submit:${token}:${ip}`, 6000))) {
    return fail("چند لحظه صبر کن و دوباره بفرست.", 429);
  }

  const name = str(body.name, 60);
  const phone = toEnglishDigits(str(body.phone, 20));
  if (name.length < 2) return fail("اسم رو بنویس.");
  if (!/^[0-9+\-\s()]{7,20}$/.test(phone) || phone.replace(/\D/g, "").length < 7) return fail("شماره‌ی تماس معتبر نیست.");

  let data: Record<string, unknown> = {};

  if (kind === "order") {
    const itemsIn = Array.isArray(body.items) ? body.items.slice(0, 60) : [];
    const items = itemsIn
      .map((it) => {
        const o = (it && typeof it === "object" ? it : {}) as Record<string, unknown>;
        const qty = Math.round(Number(o.qty));
        return { name: str(o.name, 80), qty, price: str(o.price, 40) };
      })
      .filter((it) => it.name && Number.isFinite(it.qty) && it.qty >= 1 && it.qty <= 99);
    const text = str(body.text, 600);
    if (items.length === 0 && text.length < 3) return fail("سفارشی انتخاب نشده.");
    const type = ["delivery", "pickup", "dinein"].includes(String(body.type)) ? String(body.type) : "pickup";
    const address = str(body.address, 300);
    if (type === "delivery" && address.length < 6) return fail("آدرس رو کامل بنویس.");
    const totalNum = Number(body.total);
    data = {
      items,
      text,
      type,
      address: type === "delivery" ? address : "",
      table: type === "dinein" ? str(body.table, 20) : "",
      total: Number.isFinite(totalNum) && totalNum > 0 && totalNum < 1e12 ? Math.round(totalNum) : null,
      unit: body.unit === "ریال" ? "ریال" : "تومان",
      note: str(body.note, 300),
    };
  } else if (kind === "reserve") {
    const date = str(body.date, 10);
    const time = str(body.time, 5);
    const guests = Math.round(Number(body.guests));
    if (!isDate(date) || date < earliestDate()) return fail("تاریخ رزرو معتبر نیست.");
    if (!isTime(time)) return fail("ساعت رزرو معتبر نیست.");
    if (!Number.isFinite(guests) || guests < 1 || guests > 40) return fail("تعداد نفرات معتبر نیست.");
    data = { date, time, guests, note: str(body.note, 300) };
  } else if (kind === "appointment") {
    const service = str(body.service, 80);
    const date = str(body.date, 10);
    if (!service) return fail("خدمت یا پزشک مورد نظر رو بنویس.");
    if (date && (!isDate(date) || date < earliestDate())) return fail("تاریخ معتبر نیست.");
    const period = ["morning", "noon", "evening"].includes(String(body.period)) ? String(body.period) : "";
    data = { service, date, period, note: str(body.note, 300) };
  } else {
    data = { topic: str(body.service, 80), note: str(body.note, 300) };
  }

  try {
    const created = await createSiteRequest({ site_id: site.id, kind: kind as SiteRequestKind, name, phone, data });
    return json({ ok: true, code: created.id });
  } catch (err) {
    console.error("site submit failed:", err);
    return fail("ثبت انجام نشد، دوباره امتحان کن.", 500);
  }
}
