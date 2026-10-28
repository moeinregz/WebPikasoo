"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import SiteMenuEditor, { type MenuEditorApi } from "@/app/dashboard/SiteMenuEditor";
import { formatDateTime } from "@/app/dashboard/format";
import { qrSvg } from "@/lib/siteTemplates/qr";
import type { MenuCategory } from "@/lib/siteTemplates/menu";
import type { SiteRequest, SiteRequestKind } from "@/lib/db";
import {
  panelDeleteRequestAction,
  panelListAction,
  panelLoginAction,
  panelLogoutAction,
  panelResetMenuAction,
  panelSaveMenuAction,
  panelSetStatusAction,
  panelUploadMenuImageAction,
} from "./actions";

const fa = (n: number | string) => Number(n).toLocaleString("fa-IR");

const inputClass =
  "w-full rounded-[10px] border border-ink/[0.16] bg-surface/40 px-4 py-3 text-[15px] text-ink placeholder:text-dim/60 outline-none transition focus:border-accent focus:bg-surface/70";

const STATUS_LABEL: Record<string, string> = { new: "جدید", confirmed: "تأیید شده", done: "انجام شد", canceled: "لغو شد" };
const STATUS_STYLE: Record<string, string> = {
  new: "bg-amber-500/15 text-amber-600 border-amber-500/40",
  confirmed: "bg-sky-500/15 text-sky-600 border-sky-500/40",
  done: "bg-emerald-500/15 text-emerald-600 border-emerald-500/40",
  canceled: "bg-red-500/10 text-red-500 border-red-500/30",
};
const TYPE_LABEL: Record<string, string> = { delivery: "🛵 ارسال با پیک", pickup: "🛍️ تحویل حضوری", dinein: "🍽️ سرمیز" };
const PERIOD_LABEL: Record<string, string> = { morning: "صبح", noon: "ظهر", evening: "عصر" };

function jalaliDate(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  try {
    return new Intl.DateTimeFormat("fa-IR-u-ca-persian", { dateStyle: "full" }).format(new Date(`${iso}T12:00:00`));
  } catch {
    return iso;
  }
}

// ------------------------------------------------------------------ login

export function PanelLogin({ token, brand }: { token: string; brand: string }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    setErr("");
    const res = await panelLoginAction(token, pw);
    setBusy(false);
    if (res.ok) window.location.reload();
    else setErr(res.message);
  }

  return (
    <div className="grid min-h-full place-items-center p-5">
      <div className="w-full max-w-sm rounded-card border border-ink/[0.14] bg-surface/30 p-7 text-center">
        <div className="text-4xl">🛠️</div>
        <h1 className="mt-3 font-display text-xl">پنل مدیریت</h1>
        <p className="mt-1 text-[14px] text-dim">{brand}</p>
        <input
          dir="ltr"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && pw && void submit()}
          placeholder="رمز ورود (مثلاً K7M2-9QXA)"
          autoComplete="current-password"
          className={`${inputClass} mt-6 text-center font-mono tracking-widest`}
        />
        {err && <p className="mt-3 text-[13px] font-semibold text-red-500">{err}</p>}
        <button
          type="button"
          disabled={busy || !pw.trim()}
          onClick={() => void submit()}
          className="mt-4 w-full rounded-full bg-accent px-6 py-3 text-[15px] font-bold text-black transition disabled:opacity-50"
        >
          {busy ? "در حال ورود..." : "ورود"}
        </button>
        <p className="mt-4 text-[12px] text-dim/80">رمز رو از طراح سایتت بگیر.</p>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ request cards

function Chip({ status }: { status: string }) {
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-[11.5px] font-bold ${STATUS_STYLE[status] ?? ""}`}>
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

function RequestCard({
  r,
  onStatus,
  onDelete,
}: {
  r: SiteRequest;
  onStatus: (id: number, s: string) => void;
  onDelete: (id: number) => void;
}) {
  const d = r.data as Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  const items = Array.isArray(d.items) ? (d.items as { name: string; qty: number; price?: string }[]) : [];
  const btn =
    "rounded-full border border-ink/[0.18] px-3.5 py-1.5 text-[12.5px] font-semibold text-dim transition hover:border-accent hover:text-accent";
  return (
    <div className={`rounded-card border p-4 ${r.status === "new" ? "border-amber-500/50 bg-amber-500/[0.06]" : "border-ink/[0.14] bg-surface/20"}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[15px] font-bold">
            {r.name} <span className="font-mono text-[12px] text-dim">#{fa(r.id)}</span>
          </p>
          <a href={`tel:${r.phone}`} dir="ltr" className="font-mono text-[13.5px] text-accent">
            {fa(r.phone)}
          </a>
          <p className="mt-0.5 text-[11.5px] text-dim/70">{formatDateTime(r.created_at)}</p>
        </div>
        <Chip status={r.status} />
      </div>

      <div className="mt-3 space-y-1 text-[13.5px]">
        {r.kind === "order" && (
          <>
            {items.length > 0 && (
              <ul className="rounded-md bg-canvas/50 px-3 py-2">
                {items.map((it, i) => (
                  <li key={i} className="flex justify-between gap-3 py-0.5">
                    <span>{it.name}</span>
                    <span className="text-dim">× {fa(it.qty)}</span>
                  </li>
                ))}
              </ul>
            )}
            {d.text && <p className="whitespace-pre-wrap rounded-md bg-canvas/50 px-3 py-2">{d.text}</p>}
            {d.total != null && (
              <p className="font-bold">
                جمع: {fa(d.total)} {d.unit}
              </p>
            )}
            <p>{TYPE_LABEL[d.type] ?? d.type}</p>
            {d.address && <p>📍 {d.address}</p>}
            {d.table && <p>میز: {d.table}</p>}
          </>
        )}
        {r.kind === "reserve" && (
          <>
            <p>
              📅 {jalaliDate(d.date)} · ساعت {fa(d.time)}
            </p>
            <p>👥 {fa(d.guests)} نفر</p>
          </>
        )}
        {r.kind === "appointment" && (
          <>
            <p>🩺 {d.service}</p>
            {(d.date || d.period) && (
              <p>
                {d.date ? `📅 ${jalaliDate(d.date)}` : ""} {d.period ? `· ${PERIOD_LABEL[d.period]}` : ""}
              </p>
            )}
          </>
        )}
        {r.kind === "callback" && d.topic && <p>موضوع: {d.topic}</p>}
        {d.note && <p className="text-dim">💬 {d.note}</p>}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {r.status === "new" && (
          <button type="button" className={`${btn} !border-sky-500/50 !text-sky-600`} onClick={() => onStatus(r.id, "confirmed")}>
            ✓ تأیید
          </button>
        )}
        {(r.status === "new" || r.status === "confirmed") && (
          <button type="button" className={`${btn} !border-emerald-500/50 !text-emerald-600`} onClick={() => onStatus(r.id, "done")}>
            انجام شد
          </button>
        )}
        {r.status !== "canceled" && r.status !== "done" && (
          <button type="button" className={btn} onClick={() => onStatus(r.id, "canceled")}>
            لغو
          </button>
        )}
        {(r.status === "done" || r.status === "canceled") && (
          <button type="button" className={btn} onClick={() => onStatus(r.id, "new")}>
            برگردان به جدید
          </button>
        )}
        <button
          type="button"
          className="rounded-full border border-red-500/30 px-3.5 py-1.5 text-[12.5px] font-semibold text-red-500/90 transition hover:bg-red-500/10"
          onClick={() => confirm("این مورد حذف بشه؟") && onDelete(r.id)}
        >
          حذف
        </button>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ QR tab

function QrTab({ menuUrl, brand }: { menuUrl: string; brand: string }) {
  const svg = useMemo(() => qrSvg(menuUrl, { size: 280, dark: "#111", light: "#fff", margin: 3 }), [menuUrl]);
  const [copied, setCopied] = useState(false);

  function download() {
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `qr-menu.svg`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
  function print() {
    const w = window.open("", "_blank", "width=520,height=720");
    if (!w) return;
    const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
    w.document.write(
      `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><title>QR منو</title>
      <style>body{font-family:Tahoma,sans-serif;text-align:center;padding:40px}svg{width:340px;height:340px}h1{margin:0 0 6px}p{color:#555}</style></head>
      <body><h1>${esc(brand)}</h1><p>برای دیدن منو، بارکد را اسکن کنید</p>${svg}<p dir="ltr" style="font-size:12px">${esc(menuUrl)}</p>
      <script>window.onload=function(){window.print()}</script></body></html>`
    );
    w.document.close();
  }

  return (
    <div className="mx-auto max-w-sm rounded-card border border-ink/[0.14] bg-surface/20 p-6 text-center">
      <div className="mx-auto w-[280px] max-w-full overflow-hidden rounded-xl border border-ink/10 bg-white" dangerouslySetInnerHTML={{ __html: svg }} />
      <p className="mt-4 text-[13.5px] text-dim">این بارکد رو چاپ کن و روی میزها بذار؛ مشتری با اسکن، منوی به‌روز رو می‌بینه.</p>
      <p dir="ltr" className="mt-3 break-all rounded-md bg-canvas/60 px-3 py-2 font-mono text-[12px] text-dim">
        {menuUrl}
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <button type="button" onClick={print} className="rounded-full bg-accent px-5 py-2.5 text-[13.5px] font-bold text-black">
          🖨️ چاپ
        </button>
        <button type="button" onClick={download} className="rounded-full border border-ink/[0.18] px-5 py-2.5 text-[13.5px] font-semibold text-dim hover:border-accent hover:text-accent">
          دانلود SVG
        </button>
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(menuUrl);
            } catch {
              /* ignore */
            }
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
          }}
          className="rounded-full border border-ink/[0.18] px-5 py-2.5 text-[13.5px] font-semibold text-dim hover:border-accent hover:text-accent"
        >
          {copied ? "کپی شد ✓" : "کپی لینک"}
        </button>
        <a href={menuUrl} target="_blank" rel="noopener noreferrer" className="rounded-full border border-ink/[0.18] px-5 py-2.5 text-[13.5px] font-semibold text-dim hover:border-accent hover:text-accent">
          دیدن منو
        </a>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ main

type TabId = "order" | "reserve" | "appointment" | "callback" | "menu" | "qr";

const TAB_META: Record<TabId, { label: string; icon: string }> = {
  order: { label: "سفارش‌ها", icon: "🛒" },
  reserve: { label: "رزروها", icon: "📅" },
  appointment: { label: "نوبت‌ها", icon: "🩺" },
  callback: { label: "درخواست تماس", icon: "📞" },
  menu: { label: "ویرایش منو", icon: "🍽️" },
  qr: { label: "بارکد منو", icon: "📱" },
};

export default function PanelClient({
  token,
  brand,
  features,
  initialRequests,
  menu,
  menuCustom,
  menuUrl,
  siteUrl,
}: {
  token: string;
  brand: string;
  features: string[];
  initialRequests: SiteRequest[];
  menu: MenuCategory[];
  menuCustom: boolean;
  menuUrl: string;
  siteUrl: string;
}) {
  const tabs: TabId[] = [];
  if (features.includes("order")) tabs.push("order");
  if (features.includes("reserve")) tabs.push("reserve");
  if (features.includes("appointment")) tabs.push("appointment");
  if (features.includes("callback")) tabs.push("callback");
  if (features.includes("order") || features.includes("qrmenu")) tabs.push("menu");
  if (features.includes("qrmenu")) tabs.push("qr");

  const [tab, setTab] = useState<TabId>(tabs[0] ?? "order");
  const [requests, setRequests] = useState<SiteRequest[]>(initialRequests);
  const [filter, setFilter] = useState<"active" | "all">("active");
  const knownNew = useRef<number>(initialRequests.filter((r) => r.status === "new").length);

  const menuApi: MenuEditorApi = useMemo(
    () => ({
      save: (json) => panelSaveMenuAction(token, json),
      reset: () => panelResetMenuAction(token),
      upload: (fd) => panelUploadMenuImageAction(token, fd),
    }),
    [token]
  );

  // auto-refresh + a soft beep when a new request arrives
  useEffect(() => {
    let alive = true;
    async function tick() {
      if (document.hidden) return;
      const res = await panelListAction(token);
      if (!alive || !res.ok) return;
      setRequests(res.requests);
      const n = res.requests.filter((r) => r.status === "new").length;
      if (n > knownNew.current) beep();
      knownNew.current = n;
    }
    const id = setInterval(() => void tick(), 20000);
    const vis = () => !document.hidden && void tick();
    document.addEventListener("visibilitychange", vis);
    return () => {
      alive = false;
      clearInterval(id);
      document.removeEventListener("visibilitychange", vis);
    };
  }, [token]);

  const newCount = requests.filter((r) => r.status === "new").length;
  useEffect(() => {
    document.title = `${newCount ? `(${fa(newCount)}) ` : ""}پنل ${brand}`;
  }, [newCount, brand]);

  function beep() {
    try {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctx();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = 880;
      g.gain.value = 0.08;
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + 0.22);
    } catch {
      /* sound is a nicety */
    }
  }

  async function setStatus(id: number, status: string) {
    const prev = requests;
    setRequests((rs) => rs.map((r) => (r.id === id ? { ...r, status: status as SiteRequest["status"] } : r)));
    const res = await panelSetStatusAction(token, id, status);
    if (!res.ok) setRequests(prev);
  }
  async function remove(id: number) {
    const prev = requests;
    setRequests((rs) => rs.filter((r) => r.id !== id));
    const res = await panelDeleteRequestAction(token, id);
    if (!res.ok) setRequests(prev);
  }

  const countFor = (k: SiteRequestKind) => requests.filter((r) => r.kind === k && r.status === "new").length;

  const shown = (kind: SiteRequestKind) =>
    requests.filter((r) => r.kind === kind && (filter === "all" || r.status === "new" || r.status === "confirmed"));

  return (
    <div className="mx-auto max-w-3xl p-4 pb-16 sm:p-6">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[12px] text-dim">پنل مدیریت</p>
          <h1 className="font-display text-2xl">{brand}</h1>
        </div>
        <div className="flex items-center gap-2">
          <a href={siteUrl} target="_blank" rel="noopener noreferrer" className="rounded-full border border-ink/[0.18] px-4 py-2 text-[12.5px] font-semibold text-dim hover:border-accent hover:text-accent">
            دیدن سایت
          </a>
          <button
            type="button"
            onClick={async () => {
              await panelLogoutAction(token);
              window.location.reload();
            }}
            className="rounded-full border border-ink/[0.18] px-4 py-2 text-[12.5px] font-semibold text-dim hover:border-red-500/50 hover:text-red-500"
          >
            خروج
          </button>
        </div>
      </header>

      <nav className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {tabs.map((t) => {
          const n = t === "menu" || t === "qr" ? 0 : countFor(t);
          return (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`relative flex-none whitespace-nowrap rounded-full border px-4 py-2 text-[13.5px] font-bold transition ${
                tab === t ? "border-accent bg-accent text-black" : "border-ink/[0.18] text-dim hover:border-accent"
              }`}
            >
              {TAB_META[t].icon} {TAB_META[t].label}
              {n > 0 && <span className="mr-2 rounded-full bg-red-500 px-1.5 py-0.5 text-[11px] font-bold text-white">{fa(n)}</span>}
            </button>
          );
        })}
      </nav>

      {tabs.length === 0 && <p className="text-dim">هنوز قابلیتی برای این سایت فعال نشده.</p>}

      {(tab === "order" || tab === "reserve" || tab === "appointment" || tab === "callback") && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[13px] text-dim">هر ۲۰ ثانیه خودکار به‌روز می‌شه.</p>
            <div className="flex gap-1 rounded-full border border-ink/[0.16] p-1 text-[12px] font-semibold">
              {(["active", "all"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={`rounded-full px-3 py-1 ${filter === f ? "bg-ink text-canvas" : "text-dim"}`}
                >
                  {f === "active" ? "فعال" : "همه"}
                </button>
              ))}
            </div>
          </div>
          {shown(tab).length === 0 ? (
            <div className="rounded-card border border-dashed border-ink/[0.2] p-10 text-center text-dim">
              {filter === "active" ? "مورد فعالی نیست." : "هنوز چیزی ثبت نشده."}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {shown(tab).map((r) => (
                <RequestCard key={r.id} r={r} onStatus={(id, s) => void setStatus(id, s)} onDelete={(id) => void remove(id)} />
              ))}
            </div>
          )}
        </section>
      )}

      {tab === "menu" && <SiteMenuEditor siteId={0} token={token} initial={menu} custom={menuCustom} api={menuApi} />}
      {tab === "qr" && <QrTab menuUrl={menuUrl} brand={brand} />}
    </div>
  );
}
