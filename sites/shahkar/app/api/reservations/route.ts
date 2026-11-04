import { NextResponse } from "next/server";
import { createReservation } from "@/lib/db";
import { normalizeMobile, toEn } from "@/lib/fa";
import { AREAS, EVENT_TYPES, TIMES } from "@/lib/site";

export const runtime = "nodejs";

// Small in-memory throttle: 5 requests / 10 minutes per IP.
const hits = new Map<string, number[]>();
function throttled(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 5;
}

const clean = (v: unknown, max: number) =>
  typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (throttled(ip)) {
    return NextResponse.json(
      { ok: false, error: "تعداد درخواست‌ها زیاد است؛ چند دقیقه‌ی دیگر دوباره تلاش کنید یا تماس بگیرید." },
      { status: 429 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "درخواست نامعتبر است." }, { status: 400 });
  }

  // Honeypot field — real visitors never fill it.
  if (clean(body.website, 100)) return NextResponse.json({ ok: true, id: 0 });

  const name = clean(body.name, 80);
  const phone = normalizeMobile(clean(body.phone, 20));
  const event_type = clean(body.event_type, 40);
  const guests = Number.parseInt(toEn(clean(body.guests, 6)), 10);
  const date_text = clean(body.date_text, 60);
  const time_text = clean(body.time_text, 20);
  const area = clean(body.area, 30);
  const notes = clean(body.notes, 600);

  const errors: Record<string, string> = {};
  if (name.length < 2) errors.name = "نام را وارد کنید.";
  if (!phone) errors.phone = "شماره موبایل معتبر نیست.";
  if (!(EVENT_TYPES as readonly string[]).includes(event_type)) errors.event_type = "نوع مراسم را انتخاب کنید.";
  if (!Number.isFinite(guests) || guests < 1 || guests > 2000) errors.guests = "تعداد مهمانان را وارد کنید.";
  if (date_text.length < 2) errors.date_text = "تاریخ را وارد کنید.";
  if (time_text && !(TIMES as readonly string[]).includes(time_text)) errors.time_text = "زمان نامعتبر است.";
  if (area && !(AREAS as readonly string[]).includes(area)) errors.area = "فضا نامعتبر است.";

  if (Object.keys(errors).length) {
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  const id = createReservation({
    name,
    phone: phone!,
    event_type,
    guests,
    date_text,
    time_text,
    area,
    notes,
  });
  return NextResponse.json({ ok: true, id });
}
