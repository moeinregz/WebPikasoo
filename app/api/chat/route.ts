import Anthropic from "@anthropic-ai/sdk";
import { runChat, type ChatEvent, type ChatTurn } from "@/lib/chatbot";
import { intentReply, OFF_TOPIC_REPLIES, signature, type ChatAction } from "@/lib/chatIntents";
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

const HANDOFF: ChatAction = { label: "صحبت با کارشناس", kind: "handoff" };

/** A reply that needs no model call, streamed in small pieces so it reads
 *  like the AI answers. */
function cannedStream(text: string, actions: ChatAction[]) {
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const emit = (e: ChatEvent) => controller.enqueue(encoder.encode(JSON.stringify(e) + "\n"));
      const words = text.split(/(\s+)/);
      for (let i = 0; i < words.length; i += 6) {
        emit({ t: "text", v: words.slice(i, i + 6).join("") });
        await new Promise((r) => setTimeout(r, 25));
      }
      if (actions.length) emit({ t: "actions", v: actions });
      emit({ t: "done" });
      controller.close();
    },
  });
}

const STREAM_HEADERS = { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store", "X-Accel-Buffering": "no" };

export async function POST(request: Request) {
  const ip = (request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown").split(",")[0].trim();
  if (!(await allowAndCooldown(`chat:${ip}`, 1500))) return bad("یه لحظه صبر کن و دوباره بفرست.", 429);
  if (!(await allowCount(`chat-hour:${ip}`, 60, 60 * 60_000))) {
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

  // 1) Keyword replies: greetings, prices, services, site types, support...
  const userTurns = history.filter((t) => t.role === "user").map((t) => t.content);
  const last = userTurns[userTurns.length - 1];
  const earlier = userTurns.slice(0, -1);
  const canned = intentReply(last, earlier);
  if (canned) return new Response(cannedStream(canned.text, canned.actions), { headers: STREAM_HEADERS });

  // 2) Nothing matched and no model configured: the off-topic reply.
  if (!process.env.ANTHROPIC_API_KEY) {
    const misses = earlier.filter((m) => !signature(m)).length;
    return new Response(cannedStream(OFF_TOPIC_REPLIES[misses % OFF_TOPIC_REPLIES.length], [HANDOFF]), { headers: STREAM_HEADERS });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const emit = (e: ChatEvent) => controller.enqueue(encoder.encode(JSON.stringify(e) + "\n"));
      try {
        // 3) The model answers related questions and declines the rest.
        await runChat(history, emit, request.signal);
        emit({ t: "actions", v: [HANDOFF] });
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

  return new Response(stream, { headers: STREAM_HEADERS });
}
