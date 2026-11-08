import { createHash, randomBytes, timingSafeEqual } from "crypto";
import { addTicketMessage, createGuestTicket, getTicketById, getTicketMessages } from "@/lib/db";
import { allowAndCooldown, allowCount } from "@/lib/redis";

// Visitor side of "صحبت با کارشناس" in the site chat. Opening creates a
// guest ticket (shown in /dashboard like any other) and returns a random
// secret; the browser keeps {id, token} and uses them to read the thread
// and add messages. Staff answer from the dashboard ticket page.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const hash = (token: string) => createHash("sha256").update(token).digest("hex");

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

function clientIp(request: Request) {
  return (request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown").split(",")[0].trim();
}

function normalizePhone(raw: string): string | null {
  let p = raw
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/[\s\-()]/g, "");
  if (p.startsWith("+98")) p = "0" + p.slice(3);
  else if (p.startsWith("0098")) p = "0" + p.slice(4);
  return /^09\d{9}$/.test(p) ? p : null;
}

/** The ticket if `token` belongs to it (constant-time compare). */
async function authorized(id: unknown, token: unknown) {
  if (typeof id !== "number" || !Number.isInteger(id) || typeof token !== "string" || token.length < 20) return null;
  const ticket = await getTicketById(id);
  if (!ticket?.guest_token_hash) return null;
  const a = Buffer.from(ticket.guest_token_hash, "hex");
  const b = Buffer.from(hash(token), "hex");
  return a.length === b.length && timingSafeEqual(a, b) ? ticket : null;
}

async function thread(ticketId: number, guestName: string) {
  const rows = await getTicketMessages(ticketId);
  return rows.map((m) => ({
    id: m.id,
    from: m.sender_role === "customer" ? "me" : "team",
    name: m.sender_role === "customer" ? guestName : m.sender_name || "کارشناس وب پیکاسو",
    text: m.message,
    at: m.created_at,
  }));
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const ticket = await authorized(Number(url.searchParams.get("id")), url.searchParams.get("token"));
  if (!ticket) return json({ error: "not_found" }, 404);
  return json({ status: ticket.status, messages: await thread(ticket.id, ticket.guest_name || "شما") });
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ error: "درخواست نامعتبره." }, 400);
  }
  const ip = clientIp(request);

  if (body.action === "open") {
    const name = typeof body.name === "string" ? body.name.trim().slice(0, 80) : "";
    const phone = typeof body.phone === "string" ? normalizePhone(body.phone) : null;
    const note = typeof body.message === "string" ? body.message.trim().slice(0, 2000) : "";
    if (!name) return json({ error: "اسمتون رو وارد کنید." }, 400);
    if (!phone) return json({ error: "شماره موبایل معتبر نیست (۱۱ رقم و با ۰۹ شروع بشه)." }, 400);
    if (!(await allowAndCooldown(`chatticket:${ip}`, 60_000)) || !(await allowAndCooldown(`chatticket:${phone}`, 60_000))) {
      return json({ error: "همین الان یه گفتگو ثبت شد؛ یه دقیقه صبر کنید." }, 429);
    }
    const transcript = Array.isArray(body.transcript) ? body.transcript : [];
    const lines = transcript
      .slice(-20)
      .map((t) => {
        const role = (t as { role?: unknown })?.role === "user" ? "کاربر" : "دستیار";
        const text = (t as { content?: unknown })?.content;
        return typeof text === "string" && text.trim() ? `${role}: ${text.trim().slice(0, 500)}` : "";
      })
      .filter(Boolean);
    const message = [
      note ? `پیام کاربر: ${note}` : "کاربر از چت سایت درخواست صحبت با کارشناس داده.",
      lines.length ? `\nگفتگوی قبلی با دستیار:\n${lines.join("\n")}` : "",
    ]
      .join("\n")
      .slice(0, 6000);

    const token = randomBytes(24).toString("base64url");
    const id = await createGuestTicket({ name, phone, subject: `گفتگو از چت سایت — ${name}`, message, tokenHash: hash(token) });
    return json({ id, token, name });
  }

  if (body.action === "send") {
    const ticket = await authorized(body.id, body.token);
    if (!ticket) return json({ error: "گفتگو پیدا نشد." }, 404);
    const text = typeof body.message === "string" ? body.message.trim().slice(0, 2000) : "";
    if (!text) return json({ error: "پیام خالیه." }, 400);
    if (ticket.status !== "open") return json({ error: "این گفتگو بسته شده؛ یه گفتگوی جدید شروع کنید." }, 409);
    if (!(await allowAndCooldown(`chatticketmsg:${ticket.id}`, 1000)) || !(await allowCount(`chatticketmsg-h:${ticket.id}`, 120, 3_600_000))) {
      return json({ error: "یه لحظه صبر کنید و دوباره بفرستید." }, 429);
    }
    await addTicketMessage({ ticketId: ticket.id, senderId: null, senderName: ticket.guest_name || "مهمان", senderRole: "customer", message: text });
    return json({ ok: true, messages: await thread(ticket.id, ticket.guest_name || "شما") });
  }

  return json({ error: "درخواست نامعتبره." }, 400);
}
