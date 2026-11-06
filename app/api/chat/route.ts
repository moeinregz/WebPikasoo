import Anthropic from "@anthropic-ai/sdk";
import { runChat, type ChatEvent, type ChatTurn } from "@/lib/chatbot";
import { allowAndCooldown, allowCount } from "@/lib/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_TURNS = 30;
const MAX_CHARS = 2000;
const MAX_TOTAL = 24000;

function bad(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

/** Validates the browser-held history: alternating user/assistant turns,
 *  starting and ending with the user, within size limits. */
function parseHistory(body: unknown): ChatTurn[] | null {
  const raw = (body as { messages?: unknown })?.messages;
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const turns: ChatTurn[] = [];
  for (const m of raw.slice(-MAX_TURNS)) {
    const role = (m as { role?: unknown })?.role;
    const content = (m as { content?: unknown })?.content;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") return null;
    const text = content.trim().slice(0, role === "user" ? MAX_CHARS : MAX_CHARS * 3);
    if (!text) continue;
    const last = turns[turns.length - 1];
    if (last && last.role === role) last.content += "\n\n" + text;
    else turns.push({ role, content: text });
  }
  // Keep the newest turns that fit the size budget.
  let total = 0;
  let start = turns.length;
  while (start > 0 && total + turns[start - 1].content.length <= MAX_TOTAL) {
    total += turns[start - 1].content.length;
    start--;
  }
  const kept = turns.slice(start);
  while (kept.length && kept[0].role !== "user") kept.shift();
  if (!kept.length || kept[kept.length - 1].role !== "user") return null;
  return kept;
}

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) return bad("دستیار فعلاً در دسترس نیست. با 09965745535 تماس بگیرید.", 503);

  const ip = (request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown").split(",")[0].trim();
  if (!(await allowAndCooldown(`chat:${ip}`, 1500))) return bad("یه لحظه صبر کن و دوباره بفرست.", 429);
  if (!(await allowCount(`chat-hour:${ip}`, 40, 60 * 60_000))) {
    return bad("تعداد پیام‌ها در این ساعت زیاد شده. برای ادامه با 09965745535 تماس بگیرید.", 429);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return bad("درخواست نامعتبره.");
  }
  const history = parseHistory(body);
  if (!history) return bad("پیام نامعتبره.");

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const emit = (e: ChatEvent) => controller.enqueue(encoder.encode(JSON.stringify(e) + "\n"));
      try {
        await runChat(history, emit, request.signal);
        emit({ t: "done" });
      } catch (e) {
        if (request.signal.aborted) {
          // visitor closed the chat or the page
        } else if (e instanceof Anthropic.RateLimitError || e instanceof Anthropic.InternalServerError) {
          emit({ t: "error", v: "سرور شلوغه؛ چند ثانیه دیگه دوباره امتحان کن." });
        } else {
          console.error("chat failed:", e);
          emit({ t: "error", v: "یه مشکلی پیش اومد. می‌تونی با 09965745535 تماس بگیری." });
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store", "X-Accel-Buffering": "no" },
  });
}
