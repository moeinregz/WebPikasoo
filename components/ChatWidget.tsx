"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { renderBlogContent } from "@/lib/blogContent";

// Floating "دستیار وب پیکاسو" chat on public pages.
//
// Bot mode talks to /api/chat (NDJSON events: text | status | actions |
// lead | error | done). The bot conversation lives in sessionStorage, so it
// survives moving between pages but starts fresh once the tab or browser
// is closed.
//
// "صحبت با کارشناس" opens a guest ticket through /api/chat/ticket; its
// {id, token} goes to localStorage, so the visitor stays connected to the
// team across visits, sees staff replies here (polled), and can keep
// writing until they end it or staff close the ticket.

type Action = { label: string; kind: "send" | "handoff" | "link"; value?: string };
type Turn = { role: "user" | "assistant"; content: string; actions?: Action[] };
type TicketRef = { id: number; token: string; name: string };
type TicketMsg = { id: number; from: "me" | "team"; name: string; text: string; at: string };

const BOT_KEY = "wp-chat-bot-v2";
const TICKET_KEY = "wp-chat-ticket-v1";
const SEEN_KEY = "wp-chat-ticket-seen";
const HIDDEN_PREFIXES = ["/dashboard", "/panel", "/preview", "/m/", "/account", "/uploads"];
const SUGGESTIONS = ["قیمت طراحی سایت چقدره؟", "یه سایت فروشگاهی می‌خوام", "قیمت سئو", "ادمینی اینستاگرام", "پشتیبانی دارید؟", "صحبت با کارشناس"];
const WELCOME =
  "سلام! من دستیار وب پیکاسو هستم. درباره‌ی طراحی سایت، قیمت‌ها، سئو، نرم‌افزار یا ادمینی اینستاگرام بپرس، یا با یکی از کارشناس‌ها صحبت کن.";

function read<T>(store: "session" | "local", key: string, fallback: T): T {
  try {
    const raw = (store === "session" ? sessionStorage : localStorage).getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(store: "session" | "local", key: string, value: unknown) {
  try {
    const s = store === "session" ? sessionStorage : localStorage;
    if (value === null) s.removeItem(key);
    else s.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — keep it in memory only */
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
  const [handoff, setHandoff] = useState(false);
  const [ticket, setTicket] = useState<TicketRef | null>(null);
  const [thread, setThread] = useState<TicketMsg[]>([]);
  const [ticketStatus, setTicketStatus] = useState("open");
  const [unread, setUnread] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const saved = read<Turn[]>("session", BOT_KEY, []);
    setTurns(Array.isArray(saved) ? saved.slice(-30) : []);
    setTicket(read<TicketRef | null>("local", TICKET_KEY, null));
  }, []);
  useEffect(() => write("session", BOT_KEY, turns.slice(-30)), [turns]);
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [turns, status, open, thread, handoff]);
  useEffect(() => {
    if (open && !handoff) inputRef.current?.focus();
  }, [open, handoff, ticket]);

  // Team thread: every 5s while the chat is open, every 30s while closed
  // (to light the unread dot on the button).
  const loadThread = useCallback(async () => {
    if (!ticket) return;
    try {
      const res = await fetch(`/api/chat/ticket?id=${ticket.id}&token=${encodeURIComponent(ticket.token)}`, { cache: "no-store" });
      if (res.status === 404) {
        write("local", TICKET_KEY, null);
        setTicket(null);
        return;
      }
      if (!res.ok) return;
      const data = (await res.json()) as { status: string; messages: TicketMsg[] };
      setThread(data.messages);
      setTicketStatus(data.status);
      const lastTeam = [...data.messages].reverse().find((m) => m.from === "team");
      if (lastTeam && read<number>("local", SEEN_KEY, 0) < lastTeam.id) {
        if (open) write("local", SEEN_KEY, lastTeam.id);
        else setUnread(true);
      }
    } catch {
      /* offline — try again on the next tick */
    }
  }, [ticket, open]);
  useEffect(() => {
    if (!ticket) return;
    loadThread();
    const t = setInterval(loadThread, open ? 5000 : 30000);
    return () => clearInterval(t);
  }, [ticket, open, loadThread]);
  useEffect(() => {
    if (open) setUnread(false);
  }, [open]);

  if (HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))) return null;

  // ------------------------------------------------------------- bot mode
  async function send(text: string) {
    const q = text.trim();
    if (!q || busy) return;
    if (ticket) return sendToTeam(q);
    if (/^صحبت با کارشناس$/.test(q)) {
      setHandoff(true);
      return;
    }
    const history: Turn[] = [...turns, { role: "user", content: q.slice(0, 2000) }];
    setTurns([...history, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);
    setStatus("در حال نوشتن…");
    setNotice("");
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    let answer = "";
    let actions: Action[] | undefined;
    const show = () =>
      setTurns((cur) => {
        const next = cur.slice();
        next[next.length - 1] = { role: "assistant", content: answer, actions };
        return next;
      });
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.map(({ role, content }) => ({ role, content })) }),
        signal: ctrl.signal,
      });
      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => null);
        answer = err?.error || "یه مشکلی پیش اومد. دوباره امتحان کن.";
        show();
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
          let ev: { t: string; v?: unknown };
          try {
            ev = JSON.parse(line);
          } catch {
            continue;
          }
          if (ev.t === "text" && typeof ev.v === "string") {
            answer += ev.v;
            setStatus("");
            show();
          } else if (ev.t === "status" && typeof ev.v === "string") setStatus(ev.v);
          else if (ev.t === "actions" && Array.isArray(ev.v)) {
            actions = ev.v as Action[];
            show();
          } else if (ev.t === "lead") setNotice("شماره‌تون ثبت شد؛ کارشناس‌های ما در ساعت کاری تماس می‌گیرن.");
          else if (ev.t === "error" && typeof ev.v === "string") {
            answer = answer ? `${answer}\n\n${ev.v}` : ev.v;
            show();
          }
        }
      }
    } catch {
      if (!ctrl.signal.aborted && !answer) {
        answer = "ارتباط قطع شد. دوباره امتحان کن.";
        show();
      }
    } finally {
      if (!answer.trim()) {
        answer = "جوابی دریافت نشد. دوباره امتحان کن.";
        show();
      }
      setBusy(false);
      setStatus("");
      abortRef.current = null;
    }
  }

  function runAction(a: Action) {
    if (a.kind === "handoff") setHandoff(true);
    else if (a.kind === "send" && a.value) send(a.value);
    else if (a.kind === "link" && a.value) window.location.href = a.value;
  }

  // ----------------------------------------------------------- team mode
  async function openTicket(form: HTMLFormElement) {
    const fd = new FormData(form);
    setBusy(true);
    setNotice("");
    try {
      const res = await fetch("/api/chat/ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "open",
          name: fd.get("name"),
          phone: fd.get("phone"),
          message: fd.get("message"),
          transcript: turns.map(({ role, content }) => ({ role, content })),
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.id) {
        setNotice(data?.error || "ثبت انجام نشد. می‌تونید با 09965745535 تماس بگیرید.");
        return;
      }
      const ref: TicketRef = { id: data.id, token: data.token, name: data.name };
      write("local", TICKET_KEY, ref);
      setTicket(ref);
      setHandoff(false);
      setThread([]);
      setTicketStatus("open");
    } catch {
      setNotice("ارتباط قطع شد. دوباره امتحان کنید.");
    } finally {
      setBusy(false);
    }
  }

  async function sendToTeam(text: string) {
    if (!ticket) return;
    setInput("");
    setBusy(true);
    setThread((cur) => [...cur, { id: -Date.now(), from: "me", name: ticket.name, text, at: "" }]);
    try {
      const res = await fetch("/api/chat/ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", id: ticket.id, token: ticket.token, message: text }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.messages) setThread(data.messages);
      else {
        setNotice(data?.error || "پیام ارسال نشد. دوباره امتحان کنید.");
        setInput(text);
        loadThread();
      }
    } catch {
      setNotice("ارتباط قطع شد. دوباره امتحان کنید.");
      setInput(text);
    } finally {
      setBusy(false);
    }
  }

  function endTicket() {
    if (!window.confirm("گفتگو با کارشناس از این مرورگر بسته بشه؟ پیام‌هاتون برای تیم باقی می‌مونه.")) return;
    write("local", TICKET_KEY, null);
    setTicket(null);
    setThread([]);
    setNotice("");
  }

  function resetBot() {
    abortRef.current?.abort();
    setTurns([]);
    setNotice("");
    setHandoff(false);
  }

  const inTeam = !!ticket;
  const closedTicket = inTeam && ticketStatus !== "open";

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="گفتگو با دستیار وب پیکاسو"
          className="fixed bottom-[calc(env(safe-area-inset-bottom)+16px)] right-4 z-[95] flex items-center gap-2 rounded-full bg-accent py-3 pl-5 pr-3.5 text-white shadow-lg ring-4 ring-accent/20 transition hover:bg-accent2 sm:bottom-6 sm:right-6"
        >
          <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
              <path d="M4 5h16v11H8l-4 4V5Z" strokeLinejoin="round" />
              <path d="M8 9.5h8M8 12.5h5" strokeLinecap="round" />
            </svg>
            <span className={`absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-accent ${unread ? "animate-pulse bg-red-500" : "bg-accent3"}`} />
          </span>
          <span className="text-[14.5px] font-black">{unread ? "پیام جدید از کارشناس" : inTeam ? "گفتگو با کارشناس" : "سوالی داری؟ بپرس"}</span>
        </button>
      )}

      {open && (
        <div
          role="dialog"
          aria-label={inTeam ? "گفتگو با کارشناس وب پیکاسو" : "دستیار وب پیکاسو"}
          className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+12px)] top-[72px] z-[95] flex flex-col overflow-hidden rounded-card border border-ink/15 bg-canvas shadow-2xl sm:inset-x-auto sm:bottom-6 sm:right-6 sm:top-auto sm:h-[620px] sm:max-h-[calc(100vh-48px)] sm:w-[400px]"
        >
          <div className="flex items-center justify-between border-b border-ink/10 bg-accent px-4 py-3 text-white">
            <div>
              <p className="text-[15px] font-bold">{inTeam ? "گفتگو با کارشناس" : "دستیار وب پیکاسو"}</p>
              <p className="text-[12px] opacity-85">
                {inTeam ? (closedTicket ? "این گفتگو بسته شده" : "پاسخ در ساعت کاری (شنبه تا پنجشنبه ۱۰ تا ۱۶)") : "پاسخ فوری به سوال‌های شما"}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {inTeam ? (
                <button type="button" onClick={endTicket} className="rounded-lg px-2 py-1 text-[12px] hover:bg-white/15">
                  پایان گفتگو
                </button>
              ) : (
                turns.length > 0 && (
                  <button type="button" onClick={resetBot} className="rounded-lg px-2 py-1 text-[12px] hover:bg-white/15">
                    گفتگوی جدید
                  </button>
                )
              )}
              <button type="button" onClick={() => setOpen(false)} aria-label="بستن" className="rounded-lg p-1.5 hover:bg-white/15">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-3 py-4">
            {inTeam ? (
              <>
                <Bubble role="assistant" content={`${ticket!.name} عزیز، به کارشناس‌های وب پیکاسو وصل شدید. پیامتون برای تیم ثبت شده و جواب‌ها همین‌جا نمایش داده می‌شه؛ حتی اگه صفحه رو ببندید و بعداً برگردید.`} />
                {thread.map((m) =>
                  m.from === "me" ? (
                    <Bubble key={m.id} role="user" content={m.text} />
                  ) : (
                    <Bubble key={m.id} role="assistant" content={m.text} label={m.name} />
                  )
                )}
                {thread.length === 0 && <p className="px-2 text-[13px] text-dim">اگه توضیح بیشتری دارید، همین‌جا بنویسید.</p>}
              </>
            ) : (
              <>
                <Bubble role="assistant" content={WELCOME} />
                {turns.length === 0 && !handoff && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {SUGGESTIONS.map((s) => (
                      <Chip key={s} onClick={() => (s === "صحبت با کارشناس" ? setHandoff(true) : send(s))}>
                        {s}
                      </Chip>
                    ))}
                  </div>
                )}
                {turns.map((t, i) =>
                  t.content || t.role === "user" ? (
                    <div key={i}>
                      <Bubble role={t.role} content={t.content} />
                      {t.role === "assistant" && t.actions && t.actions.length > 0 && i === turns.length - 1 && !busy && !handoff && (
                        <div className="mt-2 flex flex-wrap justify-end gap-2">
                          {t.actions.map((a) => (
                            <Chip key={a.label} strong={a.kind === "handoff"} onClick={() => runAction(a)}>
                              {a.label}
                            </Chip>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : null
                )}
                {busy && status && <p className="px-2 text-[13px] text-dim">{status}</p>}
                {handoff && (
                  <form
                    className="space-y-2.5 rounded-2xl border border-accent/30 bg-accent/[0.06] p-3.5"
                    onSubmit={(e) => {
                      e.preventDefault();
                      openTicket(e.currentTarget);
                    }}
                  >
                    <p className="text-[14px] font-bold text-ink">صحبت با کارشناس</p>
                    <p className="text-[12.5px] leading-6 text-dim">اسم و شماره‌تون رو بنویسید؛ گفتگو برای تیم ثبت می‌شه و جواب کارشناس همین‌جا میاد.</p>
                    <input name="name" required maxLength={80} placeholder="اسم شما" className="h-11 w-full rounded-xl border border-ink/15 bg-surface px-3 text-[15px] text-ink outline-none focus:border-accent" />
                    <input name="phone" required inputMode="tel" dir="ltr" maxLength={20} placeholder="09xxxxxxxxx" className="h-11 w-full rounded-xl border border-ink/15 bg-surface px-3 text-right text-[15px] text-ink outline-none focus:border-accent" />
                    <textarea name="message" rows={2} maxLength={2000} placeholder="موضوع یا سوالتون (اختیاری)" className="w-full resize-none rounded-xl border border-ink/15 bg-surface px-3 py-2 text-[15px] text-ink outline-none focus:border-accent" />
                    <div className="flex gap-2">
                      <button type="submit" disabled={busy} className="h-10 flex-1 rounded-xl bg-accent text-[14px] font-bold text-white transition hover:bg-accent2 disabled:opacity-60">
                        وصل شدن به کارشناس
                      </button>
                      <button type="button" onClick={() => setHandoff(false)} className="h-10 rounded-xl border border-ink/20 px-3 text-[13px] text-ink">
                        انصراف
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
            {notice && <p className="rounded-xl bg-accent/10 px-3 py-2 text-[13px] text-ink">{notice}</p>}
          </div>

          {closedTicket ? (
            <div className="border-t border-ink/10 p-3 text-center">
              <button type="button" onClick={() => { write("local", TICKET_KEY, null); setTicket(null); setThread([]); }} className="h-11 w-full rounded-xl bg-accent text-[14px] font-bold text-white">
                شروع گفتگوی جدید
              </button>
            </div>
          ) : (
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
                placeholder={inTeam ? "پیامتون برای کارشناس…" : "سوالت رو بنویس…"}
                className="max-h-32 min-h-[44px] flex-1 resize-none rounded-xl border border-ink/15 bg-surface px-3 py-2.5 text-[16px] text-ink outline-none focus:border-accent sm:text-[14.5px]"
              />
              {busy && !inTeam ? (
                <button type="button" onClick={() => abortRef.current?.abort()} className="h-11 shrink-0 rounded-xl border border-ink/20 px-3 text-[13px] text-ink">
                  توقف
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim() || busy}
                  className="h-11 shrink-0 rounded-xl bg-accent px-4 text-[14px] font-bold text-white transition hover:bg-accent2 disabled:opacity-50"
                >
                  ارسال
                </button>
              )}
            </form>
          )}
        </div>
      )}
    </>
  );
}

function Chip({ children, onClick, strong = false }: { children: React.ReactNode; onClick: () => void; strong?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-[13px] transition ${
        strong ? "border-accent bg-accent text-white hover:bg-accent2" : "border-accent/40 text-accent hover:bg-accent/10"
      }`}
    >
      {children}
    </button>
  );
}

function Bubble({ role, content, label }: { role: "user" | "assistant"; content: string; label?: string }) {
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
        {label && <p className="!mb-0 !mt-2 text-[12px] font-bold text-accent">{label}</p>}
        {renderBlogContent(content)}
      </div>
    </div>
  );
}
