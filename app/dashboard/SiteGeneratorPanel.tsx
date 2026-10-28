"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { generateSiteAction, type PrivateSiteFormState } from "./actions";
import { TRADES } from "@/lib/siteTemplates/trades";
import { featuresForTrade } from "@/lib/siteTemplates/features";

type TemplateOption = {
  id: string;
  trade: string;
  label: string;
  /** the template's own signature colors (null = it follows the trade palette) */
  primary: string | null;
  secondary: string | null;
};

const inputClass =
  "w-full rounded-[10px] border border-ink/[0.16] bg-surface/40 px-4 py-3 text-[14.5px] text-ink placeholder:text-dim/60 outline-none transition focus:border-accent focus:bg-surface/70";

const labelClass = "mb-1.5 block text-[12.5px] font-semibold text-dim";

const MAX_PHONES = 3;
const NEEDS_PANEL = ["order", "reserve", "appointment", "callback"];

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="mt-2 rounded-full bg-accent px-6 py-3 text-[14.5px] font-semibold text-black transition hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60"
    >
      {pending ? "در حال ساخت..." : "ساخت سایت و لینک"}
    </button>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }
  return (
    <button
      type="button"
      onClick={copy}
      className="whitespace-nowrap rounded-full border border-ink/[0.18] px-3 py-1.5 text-[12px] font-semibold text-dim transition hover:border-accent hover:text-accent"
    >
      {copied ? "کپی شد ✓" : "کپی لینک"}
    </button>
  );
}

function fullLink(path: string) {
  if (typeof window === "undefined") return path;
  return `${window.location.origin}${path}`;
}

/** One optional color. While "default" is ticked nothing is submitted and the
 *  server falls back to the trade's own color. */
function ColorField({
  label,
  name,
  value,
  defaultColor,
  onChange,
}: {
  label: string;
  name: string;
  value: string | null; // null = use the trade default
  defaultColor: string;
  onChange: (v: string | null) => void;
}) {
  const useDefault = value === null;
  return (
    <div className="rounded-lg border border-ink/[0.12] bg-surface/30 p-3">
      <span className={labelClass}>{label}</span>
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="color"
          name={name}
          value={value ?? defaultColor}
          disabled={useDefault}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-14 cursor-pointer rounded-md border border-ink/[0.16] bg-transparent disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={label}
        />
        <label className="flex cursor-pointer items-center gap-2 text-[13px] text-dim">
          <input
            type="checkbox"
            checked={useDefault}
            onChange={(e) => onChange(e.target.checked ? null : defaultColor)}
            className="h-4 w-4 accent-[var(--accent,#d4a857)]"
          />
          رنگ پیش‌فرض قالب
        </label>
      </div>
    </div>
  );
}

const initialState: PrivateSiteFormState = null;

export default function SiteGeneratorPanel({ templates }: { templates: TemplateOption[] }) {
  const [state, formAction] = useFormState(generateSiteAction, initialState);

  const [tradeId, setTradeId] = useState(TRADES[0].id);
  const [templateId, setTemplateId] = useState(""); // "" = random
  const [brand, setBrand] = useState("");
  const [address, setAddress] = useState("");
  const [hours, setHours] = useState("");
  const [phones, setPhones] = useState<string[]>([""]);
  const [color1, setColor1] = useState<string | null>(null);
  const [feats, setFeats] = useState<string[]>([]);
  const [color2, setColor2] = useState<string | null>(null);
  const [instagram, setInstagram] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  const trade = TRADES.find((t) => t.id === tradeId) ?? TRADES[0];
  const tradeTemplates = templates.filter((t) => t.trade === tradeId);
  const tradeFeatures = featuresForTrade(tradeId);
  const noTemplates = tradeTemplates.length === 0;
  // Each template has its own signature colors; show those as the "default".
  const shownTemplate = tradeTemplates.find((t) => t.id === templateId) ?? tradeTemplates[0];
  const defaultPrimary = shownTemplate?.primary ?? trade.colors.primary;
  const defaultSecondary = shownTemplate?.secondary ?? trade.colors.secondary;

  // Clear everything once a site was actually created; keep the input when it
  // failed so nothing typed gets lost.
  useEffect(() => {
    if (state?.ok) {
      setBrand("");
      setAddress("");
      setHours("");
      setPhones([""]);
      setColor1(null);
      setColor2(null);
      setInstagram("");
      setWhatsapp("");
      setTemplateId("");
    }
  }, [state]);

  function changeTrade(id: string) {
    setTradeId(id);
    setTemplateId("");
    // A color picked for one trade is rarely right for another.
    setColor1(null);
    setColor2(null);
  }

  return (
    <form action={formAction} className="rounded-card border border-ink/[0.14] bg-surface/20 p-6">
      <div className="mb-5">
        <h2 className="font-display text-lg font-normal">ساخت سایت از قالب</h2>
        <p className="mt-1 text-[12.5px] text-dim/80">
          صنف و مشخصات رو بده؛ یکی از نمونه‌کارهای آماده‌ی همون صنف با این اطلاعات ساخته می‌شه و لینک خصوصی‌اش تو تب
          «سایت‌های خصوصی» هم ذخیره می‌شه.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>صنف</label>
          <select
            name="trade"
            value={tradeId}
            onChange={(e) => changeTrade(e.target.value)}
            className={inputClass}
          >
            {TRADES.map((t) => {
              const n = templates.filter((x) => x.trade === t.id).length;
              return (
                <option key={t.id} value={t.id}>
                  {t.label}
                  {n === 0 ? " (هنوز قالبی نیست)" : ` (${n} قالب)`}
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <label className={labelClass}>قالب</label>
          <select
            name="template"
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            disabled={noTemplates}
            className={inputClass}
          >
            <option value="">تصادفی</option>
            {tradeTemplates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>اسم برند</label>
          <input
            name="brand"
            required
            maxLength={80}
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="مثلاً: کافه امید"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>آدرس</label>
          <input
            name="address"
            required
            maxLength={300}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="مثلاً: تهران، مسعودیه، خیابان ..."
            className={inputClass}
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>شماره تماس (تا {MAX_PHONES} شماره)</label>
          <div className="flex flex-col gap-2">
            {phones.map((p, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  name="phone"
                  required={i === 0}
                  inputMode="tel"
                  dir="ltr"
                  value={p}
                  onChange={(e) => setPhones((prev) => prev.map((x, j) => (j === i ? e.target.value : x)))}
                  placeholder={i === 0 ? "021-12345678" : "شماره‌ی اضافه (اختیاری)"}
                  className={`${inputClass} text-left`}
                />
                {i > 0 && (
                  <button
                    type="button"
                    onClick={() => setPhones((prev) => prev.filter((_, j) => j !== i))}
                    className="whitespace-nowrap rounded-full border border-red-500/30 px-3 py-2 text-[12px] font-semibold text-red-500/90 transition hover:bg-red-500/10"
                  >
                    حذف
                  </button>
                )}
              </div>
            ))}
          </div>
          {phones.length < MAX_PHONES && (
            <button
              type="button"
              onClick={() => setPhones((prev) => [...prev, ""])}
              className="mt-2 text-[13px] font-semibold text-accent transition hover:underline"
            >
              + افزودن شماره
            </button>
          )}
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>ساعت کاری (اختیاری — اگه خالی بمونه این بخش تو سایت نمایش داده نمی‌شه)</label>
          <input
            name="hours"
            maxLength={200}
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            placeholder="مثلاً: همه روزه ۸ صبح تا ۱۱ شب"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>اینستاگرام (اختیاری)</label>
          <input
            name="instagram"
            dir="ltr"
            maxLength={100}
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="@cafe_omid"
            className={`${inputClass} text-left`}
          />
        </div>

        <div>
          <label className={labelClass}>واتساپ (اختیاری)</label>
          <input
            name="whatsapp"
            inputMode="tel"
            dir="ltr"
            maxLength={20}
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="09123456789"
            className={`${inputClass} text-left`}
          />
        </div>

        <ColorField
          label="رنگ اصلی (اختیاری)"
          name="color1"
          value={color1}
          defaultColor={defaultPrimary}
          onChange={setColor1}
        />
        <ColorField
          label="رنگ دوم (اختیاری)"
          name="color2"
          value={color2}
          defaultColor={defaultSecondary}
          onChange={setColor2}
        />
      </div>

      {tradeFeatures.length > 0 && (
        <div className="mt-4 rounded-[12px] border border-ink/[0.14] p-4">
          <p className="text-[13px] font-bold">قابلیت‌های اضافه (اختیاری)</p>
          <p className="mb-3 mt-1 text-[12px] text-dim/80">بعداً هم از تب «سایت‌های خصوصی ← ⚙️ قابلیت‌ها» می‌شه عوضشون کرد.</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {tradeFeatures.map((f) => {
              const locked = f.id === "panel" && feats.some((x) => NEEDS_PANEL.includes(x));
              const checked = feats.includes(f.id) || locked;
              return (
                <label key={f.id} className={`flex cursor-pointer items-start gap-3 rounded-[12px] border p-3 ${checked ? "border-accent bg-accent/[0.07]" : "border-ink/[0.14]"}`}>
                  <input
                    type="checkbox"
                    name="feature"
                    value={f.id}
                    checked={checked}
                    disabled={locked}
                    onChange={() => setFeats((cur) => (cur.includes(f.id) ? cur.filter((x) => x !== f.id) : [...cur, f.id]))}
                    className="mt-1 h-4 w-4 accent-[#0077B6]"
                  />
                  <span>
                    <span className="block text-[13.5px] font-bold">{f.icon} {f.label}</span>
                    <span className="mt-0.5 block text-[12px] text-dim">{f.desc}</span>
                  </span>
                  {locked && <input type="hidden" name="feature" value="panel" />}
                </label>
              );
            })}
          </div>
        </div>
      )}

      {noTemplates && (
        <p className="mt-3 text-sm text-amber-500">برای صنف «{trade.label}» هنوز قالبی اضافه نشده.</p>
      )}
      {state && !state.ok && <p className="mt-3 text-sm text-red-500">{state.message}</p>}
      {state?.ok && state.link && (
        <div className="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3">
          <p className="mb-2 text-[13px] font-semibold text-emerald-600">{state.message}</p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="min-w-0 flex-1 truncate font-mono text-[12.5px] text-ink" dir="ltr">
              {fullLink(state.link)}
            </span>
            <CopyButton text={fullLink(state.link)} />
            <a
              href={state.link}
              target="_blank"
              rel="noopener noreferrer"
              className="whitespace-nowrap rounded-full border border-ink/[0.18] px-3 py-1.5 text-[12px] font-semibold text-dim transition hover:border-accent hover:text-accent"
            >
              مشاهده
            </a>
          </div>
          {state.panelLink && state.panelPassword && (
            <div className="mt-3 rounded-lg border border-amber-500/50 bg-amber-500/10 p-3">
              <p className="text-[12.5px] font-bold text-amber-700">پنل مدیریت صاحب کسب‌وکار — رمز فقط همین یک بار نشون داده می‌شه</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <span dir="ltr" className="select-all font-mono text-[17px] font-bold tracking-widest">{state.panelPassword}</span>
                <CopyButton text={`${fullLink(state.panelLink)}\nرمز: ${state.panelPassword}`} />
              </div>
              <p dir="ltr" className="mt-1 truncate font-mono text-[12px] text-dim">{fullLink(state.panelLink)}</p>
            </div>
          )}
        </div>
      )}

      <SubmitButton disabled={noTemplates} />
    </form>
  );
}
