"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { renderBlogContent } from "@/lib/blogContent";

// Floating "دستیار وب پیکاسو" chat on public pages. Talks to /api/chat,
// which streams NDJSON events ({t:"text"|"status"|"lead"|"error"|"done"}).
// The conversation lives in this browser only (localStorage, best effort).

type Turn = { role: "user" | "assistant"; content: string };

const STORE_KEY = "wp-chat-v1";
const HIDDEN_PREFIXES = ["/dashboard", "/panel", "/preview", "/m/", "/account", "/uploads"];
const SUGGESTIONS = ["قیمت طراحی سایت چقدره؟", "یه سایت فروشگاهی می‌خوام", "سئو چیه و به چه دردی می‌خوره؟", "چطور باهاتون تماس بگیرم؟"];
const WELCOME =
  "سلام! من دستیار وب پیکاسو هستم. هر سوالی داری بپرس؛ از طراحی سایت، قیمت‌ها و سئو گرفته تا هر سوال دیگه‌ای که داری.";

function load(): Turn[] {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    const v = raw ? JSON.parse(raw) : [];
    return Array.isArray(v) ? v.filter((t) => t && (t.role === "user" || t.role === "assistant") && typeof t.content === "string").slice(-30) : [];
  } catch {
    return [];
  }
}

export default function ChatWidget() {
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [notice, setNotice] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => setTurns(load()), []);
  useEffect(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(turns.slice(-30)));
    } catch {
      /* storage unavailable — keep the chat in memory only */
    }
  }, [turns]);
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [turns, status, open]);
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  if (HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))) return null;

  async function send(text: string) {
    const q = text.trim();
    if (!q || busy) return;
    const history: Turn[] = [...turns, { role: "user", content: q.slice(0, 2000) }];
    setTurns([...history, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);
    setStatus("در حال نوشتن…");
    setNotice("");
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    let answer = "";
    const show = (s: string) =>
      setTurns((cur) => {
        const next = cur.slice();
        next[next.length - 1] = { role: "assistant", content: s };
        return next;
      });
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
        signal: ctrl.signal,
      });
      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => null);
        answer = err?.error || "یه مشکلی پیش اومد. دوباره امتحان کن.";
        show(answer);
        return;
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        let nl: number;
        while ((nl = buf.indexOf("\n")) >= 0) {
          const line = buf.slice(0, nl).trim();
          buf = buf.slice(nl + 1);
          if (!line) continue;
          let ev: { t: string; v?: string };
          try {
            ev = JSON.parse(line);
          } catch {
            continue;
          }
          if (ev.t === "text" && ev.v) {
            answer += ev.v;
            setStatus("");
            show(answer);
          } else if (ev.t === "status" && ev.v) setStatus(ev.v);
          else if (ev.t === "lead") setNotice("درخواستت ثبت شد؛ کارشناس‌های ما در ساعت کاری باهات تماس می‌گیرن.");
          else if (ev.t === "error" && ev.v) {
            answer = answer ? `${answer}\n\n${ev.v}` : ev.v;
            show(answer);
          }
        }
      }
    } catch {
      if (!ctrl.signal.aborted) {
        answer = answer || "ارتباط قطع شد. دوباره امتحان کن.";
        show(answer);
      }
    } finally {
      if (!answer.trim()) show("جوابی دریافت نشد. دوباره امتحان کن.");
      setBusy(false);
      setStatus("");
      abortRef.current = null;
    }
  }

  function reset() {
    abortRef.current?.abort();
    setTurns([]);
    setNotice("");
  }

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="گفتگو با دستیار وب پیکاسو"
          className="fixed bottom-[84px] left-4 z-[95] flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-lg transition hover:bg-accent2 sm:bottom-6 sm:left-6"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-7 w-7">
            <path d="M4 5h16v11H8l-4 4V5Z" strokeLinejoin="round" />
            <path d="M8 9.5h8M8 12.5h5" strokeLinecap="round" />
          </svg>
        </button>
      )}

      {open && (
        <div
          role="dialog"
          aria-label="دستیار وب پیکاسو"
          className="fixed inset-x-4 bottom-[84px] top-20 z-[95] flex flex-col overflow-hidden rounded-card border border-ink/15 bg-canvas shadow-2xl sm:inset-x-auto sm:bottom-6 sm:left-6 sm:top-auto sm:h-[600px] sm:max-h-[calc(100vh-48px)] sm:w-[400px]"
        >
          <div className="flex items-center justify-between border-b border-ink/10 bg-accent px-4 py-3 text-white">
            <div>
              <p className="text-[15px] font-bold">دستیار وب پیکاسو</p>
              <p className="text-[12px] opacity-85">هر سوالی داری بپرس</p>
            </div>
            <div className="flex items-center gap-1">
              {turns.length > 0 && (
                <button type="button" onClick={reset} className="rounded-lg px-2 py-1 text-[12px] hover:bg-white/15">
                  گفتگوی جدید
                </button>
              )}
              <button type="button" onClick={() => setOpen(false)} aria-label="بستن" className="rounded-lg p-1.5 hover:bg-white/15">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-3 py-4">
            <Bubble role="assistant" content={WELCOME} />
            {turns.length === 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="rounded-full border border-accent/40 px-3 py-1.5 text-[13px] text-accent transition hover:bg-accent/10"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            {turns.map((t, i) => (t.content || t.role === "user" ? <Bubble key={i} role={t.role} content={t.content} /> : null))}
            {busy && status && <p className="px-2 text-[13px] text-dim">{status}</p>}
            {notice && <p className="rounded-xl bg-accent/10 px-3 py-2 text-[13px] text-ink">{notice}</p>}
          </div>

          <form
            className="flex items-end gap-2 border-t border-ink/10 p-3"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              rows={1}
              maxLength={2000}
              placeholder="سوالت رو بنویس…"
              className="max-h-32 min-h-[44px] flex-1 resize-none rounded-xl border border-ink/15 bg-surface px-3 py-2.5 text-[16px] text-ink outline-none focus:border-accent sm:text-[14.5px]"
            />
            {busy ? (
              <button
                type="button"
                onClick={() => abortRef.current?.abort()}
                className="h-11 shrink-0 rounded-xl border border-ink/20 px-3 text-[13px] text-ink"
              >
                توقف
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className="h-11 shrink-0 rounded-xl bg-accent px-4 text-[14px] font-bold text-white transition hover:bg-accent2 disabled:opacity-50"
              >
                ارسال
              </button>
            )}
          </form>
        </div>
      )}
    </>
  );
}

function Bubble({ role, content }: Turn) {
  if (role === "user") {
    return (
      <div className="flex justify-start">
        <p className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-tr-sm bg-accent px-3.5 py-2.5 text-[14.5px] leading-[1.8] text-white">{content}</p>
      </div>
    );
  }
  return (
    <div className="flex justify-end">
      <div className="chat-answer max-w-[90%] rounded-2xl rounded-tl-sm border border-ink/10 bg-surface px-3.5 py-1 text-[14.5px] leading-[1.8] text-ink [&_li]:my-0.5 [&_p]:my-2 [&_ul]:my-2">
        {renderBlogContent(content)}
      </div>
    </div>
  );
}
