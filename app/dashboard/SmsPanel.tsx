"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createSmsCampaignAction,
  sendSmsBatchAction,
  sendTestSmsAction,
  setSmsOptOutAction,
  type SmsRecipient,
} from "./actions";
import { formatDateTime } from "./format";
import { defaultSmsFor, DEFAULT_SMS, OPT_OUT, previewSms, smsParts, SMS_VARS } from "@/lib/smsText";

type Contact = {
  phone: string;
  source: "crm" | "channel";
  leadId: number;
  name: string;
  tradeId: string | null;
  tradeLabel: string;
  group: string;
  status: string;
  problem: string;
  area: string;
  lastSmsAt: string | null;
  optedOut: boolean;
};

type Campaign = { id: number; created_at: string; name: string; total: number; sent: number; failed: number; visited: number; ordered: number };
type Msg = { id: number; at: string; phone: string; name: string; source: string; ok: boolean; error: string | null; text: string };

type Props = {
  contacts: Contact[];
  campaigns: Campaign[];
  messages: Msg[];
  provider: { name: string | null; ready: boolean; missing: string[] };
};

const fa = (n: number) => n.toLocaleString("fa-IR");
const card = "rounded-card border border-ink/[0.14] bg-surface/20 p-5 sm:p-6";
const input =
  "w-full rounded-[10px] border border-ink/[0.16] bg-surface/40 px-3 py-2.5 text-[14px] text-ink outline-none transition placeholder:text-dim/60 focus:border-accent";
const chip = (on: boolean) =>
  `rounded-full border px-3 py-1 text-[12.5px] font-semibold transition ${
    on ? "border-accent bg-accent text-black" : "border-ink/20 text-dim hover:border-ink/40 hover:text-ink"
  }`;

function counts<T extends string>(list: Contact[], key: (c: Contact) => T): [T, number][] {
  const m = new Map<T, number>();
  for (const c of list) m.set(key(c), (m.get(key(c)) ?? 0) + 1);
  return Array.from(m.entries()).sort((a, b) => b[1] - a[1]);
}

function toggle(set: Set<string>, v: string): Set<string> {
  const n = new Set(set);
  if (n.has(v)) n.delete(v);
  else n.add(v);
  return n;
}

function daysAgo(at: string): number {
  return (Date.now() - new Date(at.replace(" ", "T") + "Z").getTime()) / 86_400_000;
}

export default function SmsPanel({ contacts, campaigns, messages, provider }: Props) {
  const router = useRouter();

  // ---------- filters ----------
  const [q, setQ] = useState("");
  const [source, setSource] = useState<"all" | "crm" | "channel">("all");
  const [groups, setGroups] = useState<Set<string>>(new Set());
  const [trades, setTrades] = useState<Set<string>>(new Set());
  const [statuses, setStatuses] = useState<Set<string>>(new Set());
  const [problems, setProblems] = useState<Set<string>>(new Set());
  const [skipDays, setSkipDays] = useState(7);
  const [excluded, setExcluded] = useState<Set<string>>(new Set());

  const base = useMemo(() => contacts.filter((c) => !c.optedOut && (source === "all" || c.source === source)), [contacts, source]);
  const filtered = useMemo(() => {
    const s = q.trim();
    return base.filter(
      (c) =>
        (!groups.size || groups.has(c.group)) &&
        (!trades.size || trades.has(c.tradeLabel)) &&
        (!statuses.size || statuses.has(c.status)) &&
        (!problems.size || problems.has(c.problem || "مشخص نشده")) &&
        (!skipDays || !c.lastSmsAt || daysAgo(c.lastSmsAt) >= skipDays) &&
        (!s || c.name.includes(s) || c.phone.includes(s) || c.area.includes(s))
    );
  }, [base, q, groups, trades, statuses, problems, skipDays]);
  const selected = useMemo(() => filtered.filter((c) => !excluded.has(c.phone)), [filtered, excluded]);

  const groupCounts = useMemo(() => counts(base, (c) => c.group), [base]);
  const tradeCounts = useMemo(() => counts(base.filter((c) => !groups.size || groups.has(c.group)), (c) => c.tradeLabel), [base, groups]);
  const statusCounts = useMemo(() => counts(base, (c) => c.status), [base]);
  const problemCounts = useMemo(() => counts(base.filter((c) => c.source === "crm"), (c) => c.problem || "مشخص نشده"), [base]);

  // ---------- composer ----------
  const [perTrade, setPerTrade] = useState(true);
  const [oneText, setOneText] = useState(DEFAULT_SMS);
  const [texts, setTexts] = useState<Record<string, string>>({});
  const [campaignName, setCampaignName] = useState("");
  const selTrades = useMemo(() => {
    const m = new Map<string, { label: string; n: number }>();
    for (const c of selected) {
      const k = c.tradeId ?? "*";
      const cur = m.get(k) ?? { label: c.tradeId ? c.tradeLabel : "بدون صنف مشخص", n: 0 };
      cur.n++;
      m.set(k, cur);
    }
    return Array.from(m.entries()).sort((a, b) => b[1].n - a[1].n);
  }, [selected]);
  const textFor = (k: string) => texts[k] ?? (k === "*" ? DEFAULT_SMS : defaultSmsFor(k));

  const totalParts = useMemo(() => {
    if (!perTrade) return smsParts(previewSms(oneText)).parts * selected.length;
    return selTrades.reduce((sum, [k, v]) => sum + smsParts(previewSms(textFor(k))).parts * v.n, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perTrade, oneText, texts, selTrades, selected.length]);

  // ---------- sending ----------
  const [progress, setProgress] = useState<{ done: number; total: number; ok: number; fail: number; errors: string[] } | null>(null);
  const sending = !!progress && progress.done < progress.total;

  async function send() {
    if (!selected.length) return;
    const msg = `ارسال به ${fa(selected.length)} نفر (حدود ${fa(totalParts)} پیامک).${provider.ready ? "" : "\nپنل پیامکی هنوز وصل نشده؛ همه‌ی ارسال‌ها خطا می‌خورن."}\nمطمئنی؟`;
    if (!confirm(msg)) return;
    const used: Record<string, string> = perTrade ? Object.fromEntries(selTrades.map(([k]) => [k, textFor(k)])) : { "*": oneText };
    const id = await createSmsCampaignAction(campaignName || `کمپین ${new Date().toLocaleDateString("fa-IR")}`, used, selected.length);
    const recipients: SmsRecipient[] = selected.map((c) => ({ phone: c.phone, source: c.source, leadId: c.leadId, name: c.name, tradeId: perTrade ? c.tradeId : null }));
    const p = { done: 0, total: recipients.length, ok: 0, fail: 0, errors: [] as string[] };
    setProgress({ ...p });
    for (let i = 0; i < recipients.length; i += 25) {
      try {
        const res = await sendSmsBatchAction(id, recipients.slice(i, i + 25));
        for (const r of res) {
          if (r.ok) p.ok++;
          else {
            p.fail++;
            if (r.error && !p.errors.includes(r.error)) p.errors.push(r.error);
          }
        }
      } catch {
        p.fail += Math.min(25, recipients.length - i);
        if (!p.errors.includes("ارتباط با سرور قطع شد")) p.errors.push("ارتباط با سرور قطع شد");
      }
      p.done = Math.min(recipients.length, i + 25);
      setProgress({ ...p });
    }
    router.refresh();
  }

  // ---------- test ----------
  const [testPhone, setTestPhone] = useState("");
  const [testText, setTestText] = useState("سلام! این یه پیامک تستی از پنل وب پیکاسو است.");
  const [testMsg, setTestMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [testBusy, setTestBusy] = useState(false);
  async function sendTest() {
    setTestBusy(true);
    setTestMsg(null);
    const res = await sendTestSmsAction(testPhone, testText);
    setTestMsg({ ok: res.ok, text: res.message });
    setTestBusy(false);
    router.refresh();
  }

  const insertVar = (k: string, v: string) => {
    if (k === "__one") setOneText((t) => `${t}${v}`);
    else setTexts((t) => ({ ...t, [k]: `${textFor(k)}${v}` }));
  };

  // A render function, not a component: defining a component inside this one
  // would remount the textarea on every keystroke and drop focus.
  function composer({ k, value, onChange, label, n }: { k: string; value: string; onChange: (v: string) => void; label?: string; n?: number }) {
    const pv = previewSms(value, selected.find((c) => (c.tradeId ?? "*") === k)?.name || selected[0]?.name || "کافه نمونه");
    const { chars, parts } = smsParts(pv);
    return (
      <div key={k} className="rounded-[12px] border border-ink/[0.12] bg-surface/30 p-3">
        {label && (
          <div className="mb-2 flex items-center justify-between text-[13px]">
            <span className="font-bold text-ink">{label}</span>
            <span className="text-dim">{fa(n ?? 0)} نفر</span>
          </div>
        )}
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={4} className={`${input} resize-y leading-7`} />
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px] text-dim">
          <button type="button" onClick={() => insertVar(k, SMS_VARS.name)} className="rounded-full border border-ink/20 px-2.5 py-0.5 hover:text-ink">
            + اسم کسب‌وکار
          </button>
          <button type="button" onClick={() => insertVar(k, SMS_VARS.link)} className="rounded-full border border-ink/20 px-2.5 py-0.5 hover:text-ink">
            + لینک صفحه‌ی سفارش
          </button>
          {k !== "__one" && texts[k] !== undefined && (
            <button type="button" onClick={() => setTexts((t) => { const n2 = { ...t }; delete n2[k]; return n2; })} className="hover:text-ink">
              متن پیشنهادی
            </button>
          )}
          <span className="mr-auto">
            {fa(chars)} حرف · {fa(parts)} پیامک {!value.includes(SMS_VARS.link) && <b className="text-red-500">· لینک نداره!</b>}
          </span>
        </div>
        <p className="mt-2 whitespace-pre-line rounded-[10px] bg-ink/[0.04] p-2.5 text-[12.5px] leading-6 text-dim">
          {pv.replace(/x{20,}/, "webpikaso.ir/o/ab12cd")}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* provider status + test */}
      <div className={card}>
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <h3 className="ml-auto text-[17px] font-bold text-ink">پنل پیامک</h3>
          <span
            className={`rounded-full px-3 py-1 text-[12.5px] font-bold ${
              provider.ready ? "bg-emerald-500/15 text-emerald-600" : "bg-red-500/10 text-red-500"
            }`}
          >
            {provider.ready ? `وصل به ${provider.name}` : "پنل پیامکی هنوز وصل نشده"}
          </span>
        </div>
        {!provider.ready && (
          <p className="mb-4 text-[13px] leading-7 text-dim">
            همه‌چی آماده‌ست؛ فقط باید سرویس‌دهنده‌ی پیامک وصل بشه. تا اون موقع ارسال‌ها با خطای «وصل نشده» ثبت می‌شن.
            {provider.missing.length > 0 && (
              <span className="mr-1 font-mono text-[12px]" dir="ltr">
                ({provider.missing.join(", ")})
              </span>
            )}
          </p>
        )}
        <div className="grid gap-3 sm:grid-cols-[200px_1fr_auto] sm:items-start">
          <input value={testPhone} onChange={(e) => setTestPhone(e.target.value)} placeholder="شماره‌ی تست ۰۹..." className={input} dir="ltr" />
          <input value={testText} onChange={(e) => setTestText(e.target.value)} className={input} />
          <button
            onClick={sendTest}
            disabled={testBusy}
            className="rounded-full bg-accent px-5 py-2.5 text-[13.5px] font-bold text-black transition hover:-translate-y-0.5 disabled:opacity-50"
          >
            {testBusy ? "در حال ارسال…" : "ارسال پیامک تست"}
          </button>
        </div>
        {testMsg && <p className={`mt-3 rounded-md p-3 text-[13.5px] ${testMsg.ok ? "bg-emerald-500/10 text-emerald-700" : "bg-red-500/10 text-red-600"}`}>{testMsg.text}</p>}
      </div>

      {/* audience */}
      <div className={card}>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <h3 className="ml-auto text-[16px] font-bold text-ink">مخاطب‌ها (فقط شماره‌های موبایل ۰۹)</h3>
          <span className="text-[13px] text-dim">
            {fa(contacts.length)} موبایل · {fa(contacts.filter((c) => c.optedOut).length)} لغو اشتراک
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="جستجوی اسم، شماره یا منطقه…" className={input} />
          <select value={source} onChange={(e) => setSource(e.target.value as typeof source)} className={input}>
            <option value="all">CRM + کانال‌ها</option>
            <option value="crm">فقط CRM</option>
            <option value="channel">فقط کانال‌ها</option>
          </select>
          <label className="flex items-center gap-2 whitespace-nowrap text-[13px] text-dim">
            پیامک‌گرفته‌های
            <select value={skipDays} onChange={(e) => setSkipDays(Number(e.target.value))} className={`${input} w-auto py-2`}>
              <option value={0}>هیچ‌وقت حذف نشن</option>
              <option value={3}>۳ روز اخیر حذف</option>
              <option value={7}>۷ روز اخیر حذف</option>
              <option value={30}>۳۰ روز اخیر حذف</option>
            </select>
          </label>
        </div>

        <FilterRow title="دسته‌ی صنف" items={groupCounts} active={groups} onToggle={(v) => { setGroups(toggle(groups, v)); setTrades(new Set()); }} onClear={() => setGroups(new Set())} />
        <FilterRow title="صنف" items={tradeCounts} active={trades} onToggle={(v) => setTrades(toggle(trades, v))} onClear={() => setTrades(new Set())} />
        <FilterRow title="وضعیت" items={statusCounts} active={statuses} onToggle={(v) => setStatuses(toggle(statuses, v))} onClear={() => setStatuses(new Set())} />
        {problemCounts.length > 0 && (
          <FilterRow title="وضعیت سایت (CRM)" items={problemCounts} active={problems} onToggle={(v) => setProblems(toggle(problems, v))} onClear={() => setProblems(new Set())} />
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-[12px] bg-accent/[0.07] p-3 text-[13.5px]">
          <b className="text-ink">{fa(selected.length)} نفر انتخاب شدن</b>
          <span className="text-dim">از {fa(filtered.length)} نفرِ این فیلتر</span>
          {excluded.size > 0 && (
            <button onClick={() => setExcluded(new Set())} className="text-accent underline">
              همه رو دوباره انتخاب کن
            </button>
          )}
        </div>

        <div className="mt-3 max-h-[380px] overflow-auto rounded-[12px] border border-ink/[0.1]">
          <table className="w-full text-[13px]">
            <thead className="sticky top-0 bg-canvas text-dim">
              <tr>
                <th className="p-2 text-right">
                  <input
                    type="checkbox"
                    checked={selected.length === filtered.length && filtered.length > 0}
                    onChange={(e) => setExcluded(e.target.checked ? new Set() : new Set(filtered.map((c) => c.phone)))}
                  />
                </th>
                <th className="p-2 text-right">کسب‌وکار</th>
                <th className="p-2 text-right">شماره</th>
                <th className="p-2 text-right">صنف</th>
                <th className="p-2 text-right">وضعیت</th>
                <th className="p-2 text-right">آخرین پیامک</th>
                <th className="p-2" />
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 300).map((c) => (
                <tr key={c.phone} className="border-t border-ink/[0.06]">
                  <td className="p-2">
                    <input type="checkbox" checked={!excluded.has(c.phone)} onChange={() => setExcluded(toggle(excluded, c.phone))} />
                  </td>
                  <td className="p-2 text-ink">
                    {c.name}
                    <span className="mr-1 text-[11px] text-dim">{c.source === "crm" ? "CRM" : "کانال"}</span>
                  </td>
                  <td className="p-2 font-mono text-dim" dir="ltr">
                    {c.phone}
                  </td>
                  <td className="p-2 text-dim">{c.tradeLabel}</td>
                  <td className="p-2 text-dim">{c.status}</td>
                  <td className="p-2 text-dim">{c.lastSmsAt ? formatDateTime(c.lastSmsAt) : "—"}</td>
                  <td className="p-2">
                    <button
                      title="دیگه پیامک نگیره"
                      onClick={async () => {
                        if (confirm(`${c.name} دیگه پیامک تبلیغاتی نگیره؟`)) {
                          await setSmsOptOutAction(c.phone, true);
                          router.refresh();
                        }
                      }}
                      className="text-[11.5px] text-dim hover:text-red-500"
                    >
                      لغو
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length > 300 && <p className="p-2 text-center text-[12px] text-dim">{fa(filtered.length - 300)} نفر دیگه هم انتخاب شدن (توی لیست نشون داده نمی‌شن)</p>}
          {filtered.length === 0 && <p className="p-6 text-center text-[13px] text-dim">کسی با این فیلترها نیست.</p>}
        </div>
      </div>

      {/* composer */}
      <div className={card}>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <h3 className="ml-auto text-[16px] font-bold text-ink">متن پیامک</h3>
          <button onClick={() => setPerTrade(true)} className={chip(perTrade)}>
            متن جدا برای هر صنف
          </button>
          <button onClick={() => setPerTrade(false)} className={chip(!perTrade)}>
            یه متن برای همه
          </button>
        </div>
        <p className="mb-3 text-[12.5px] leading-6 text-dim">
          {SMS_VARS.name} با اسم هر کسب‌وکار و {SMS_VARS.link} با لینک اختصاصی صفحه‌ی سفارش (که همون صنف رو نشون می‌ده و اسمش رو می‌دونه) عوض می‌شه.
          «{OPT_OUT}» هم خودکار آخرش اضافه می‌شه.
        </p>
        <input value={campaignName} onChange={(e) => setCampaignName(e.target.value)} placeholder="اسم کمپین (اختیاری) — مثلاً کلینیک‌های تهران" className={`${input} mb-3`} />
        {perTrade ? (
          selTrades.length === 0 ? (
            <p className="text-[13px] text-dim">اول مخاطب انتخاب کن.</p>
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              {selTrades.map(([k, v]) => (
                composer({ k, label: v.label, n: v.n, value: textFor(k), onChange: (t) => setTexts((x) => ({ ...x, [k]: t })) })
              ))}
            </div>
          )
        ) : (
          composer({ k: "__one", value: oneText, onChange: setOneText })
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            onClick={send}
            disabled={!selected.length || sending}
            className="rounded-full bg-accent px-6 py-3 text-[14.5px] font-bold text-black transition hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-50"
          >
            {sending ? "در حال ارسال…" : `ارسال به ${fa(selected.length)} نفر`}
          </button>
          <span className="text-[13px] text-dim">حدود {fa(totalParts)} پیامک</span>
        </div>
        {progress && (
          <div className="mt-4">
            <div className="h-2 overflow-hidden rounded-full bg-ink/[0.08]">
              <div className="h-full bg-accent transition-all" style={{ width: `${(progress.done / Math.max(1, progress.total)) * 100}%` }} />
            </div>
            <p className="mt-2 text-[13px] text-dim">
              {fa(progress.done)} از {fa(progress.total)} · موفق {fa(progress.ok)} · ناموفق {fa(progress.fail)}
              {progress.errors.length > 0 && <span className="block text-red-500">خطا: {progress.errors.slice(0, 3).join(" | ")}</span>}
            </p>
          </div>
        )}
      </div>

      {/* campaigns */}
      <div className={card}>
        <h3 className="mb-3 text-[16px] font-bold text-ink">کمپین‌ها</h3>
        {campaigns.length === 0 ? (
          <p className="text-[13px] text-dim">هنوز کمپینی فرستاده نشده.</p>
        ) : (
          <div className="overflow-auto">
            <table className="w-full text-[13px]">
              <thead className="text-dim">
                <tr>
                  <th className="p-2 text-right">کمپین</th>
                  <th className="p-2 text-right">تاریخ</th>
                  <th className="p-2">مخاطب</th>
                  <th className="p-2">ارسال‌شده</th>
                  <th className="p-2">ناموفق</th>
                  <th className="p-2">بازدید صفحه</th>
                  <th className="p-2">سفارش</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr key={c.id} className="border-t border-ink/[0.06] text-center">
                    <td className="p-2 text-right text-ink">{c.name}</td>
                    <td className="p-2 text-right text-dim">{formatDateTime(c.created_at)}</td>
                    <td className="p-2">{fa(c.total)}</td>
                    <td className="p-2 text-emerald-600">{fa(c.sent)}</td>
                    <td className="p-2 text-red-500">{fa(c.failed)}</td>
                    <td className="p-2">{fa(c.visited)}</td>
                    <td className="p-2 font-bold text-accent">{fa(c.ordered)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* log */}
      <div className={card}>
        <h3 className="mb-3 text-[16px] font-bold text-ink">آخرین پیامک‌ها</h3>
        {messages.length === 0 ? (
          <p className="text-[13px] text-dim">هنوز پیامکی فرستاده نشده.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-ink/10 text-[13px]">
            {messages.map((m) => (
              <li key={m.id} className="flex flex-wrap gap-x-3 gap-y-1 py-2">
                <span className={m.ok ? "text-emerald-600" : "text-red-500"}>{m.ok ? "✓" : "✕"}</span>
                <span className="text-dim">{formatDateTime(m.at)}</span>
                <span className="font-mono text-dim" dir="ltr">
                  {m.phone}
                </span>
                <span className="text-ink">{m.source === "test" ? "تست" : m.name}</span>
                {!m.ok && <span className="text-red-500">{m.error}</span>}
                <span className="w-full truncate text-[12px] text-dim">{m.text.replace(/\n/g, " ")}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function FilterRow({
  title,
  items,
  active,
  onToggle,
  onClear,
}: {
  title: string;
  items: [string, number][];
  active: Set<string>;
  onToggle: (v: string) => void;
  onClear: () => void;
}) {
  if (!items.length) return null;
  return (
    <div className="mt-4">
      <div className="mb-2 flex items-center gap-2 text-[12.5px] font-bold text-dim">
        {title}
        {active.size > 0 && (
          <button onClick={onClear} className="font-normal text-accent underline">
            همه
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.map(([v, n]) => (
          <button key={v} onClick={() => onToggle(v)} className={chip(active.has(v))}>
            {v} <span className="opacity-70">{n.toLocaleString("fa-IR")}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
