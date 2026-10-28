"use client";

import { useMemo, useRef, useState } from "react";
import { resetPrivateSiteMenuAction, savePrivateSiteMenuAction, uploadMenuImageAction, type MenuActionResult } from "./actions";
import { shrinkImage } from "./shrinkImage";
import type { MenuCategory } from "@/lib/siteTemplates/menu";

// ---- editable (client-side) shape: the same fields + a stable key per row ----
type EItem = { key: string; name: string; desc: string; price: string; emoji: string; badge: string; image: string };
type ECat = { key: string; title: string; emoji: string; open: boolean; items: EItem[] };

const inputClass =
  "w-full rounded-[10px] border border-ink/[0.16] bg-surface/40 px-3 py-2 text-[13.5px] text-ink placeholder:text-dim/60 outline-none transition focus:border-accent focus:bg-surface/70";
const iconBtn =
  "grid h-8 w-8 place-items-center rounded-full border border-ink/[0.16] text-[13px] text-dim transition hover:border-accent hover:text-accent disabled:pointer-events-none disabled:opacity-30";
const fa = (n: number) => n.toLocaleString("fa-IR");

function move<T>(list: T[], i: number, d: -1 | 1): T[] {
  const j = i + d;
  if (j < 0 || j >= list.length) return list;
  const next = [...list];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

/** Where the editor saves to. By default the admin's dashboard actions; the owner's
 *  panel (/panel/<token>) passes its own, token-checked ones. */
export type MenuEditorApi = {
  save: (menuJson: string) => Promise<MenuActionResult>;
  reset: () => Promise<MenuActionResult>;
  upload: (fd: FormData) => Promise<MenuActionResult>;
};

/** Edits the menu of a café / restaurant site: categories, items, prices and a
 *  photo per item. Saved menus are swapped into the live page when
 *  /preview/<token> is served — no rebuild needed. */
export default function SiteMenuEditor({
  siteId,
  token,
  initial,
  custom,
  api,
}: {
  siteId: number;
  token: string;
  initial: MenuCategory[];
  custom: boolean;
  api?: MenuEditorApi;
}) {
  const seq = useRef(0);
  const uid = () => `k${++seq.current}`;
  const fromMenu = (m: MenuCategory[]): ECat[] =>
    m.map((c, i) => ({
      key: uid(),
      title: c.title,
      emoji: c.emoji ?? "",
      open: i === 0,
      items: c.items.map((it) => ({
        key: uid(),
        name: it.name,
        desc: it.desc ?? "",
        price: it.price ?? "",
        emoji: it.emoji ?? "",
        badge: it.badge ?? "",
        image: it.image ?? "",
      })),
    }));
  const toMenu = (cats: ECat[]): MenuCategory[] =>
    cats.map((c) => ({
      title: c.title.trim(),
      ...(c.emoji.trim() ? { emoji: c.emoji.trim() } : {}),
      items: c.items.map((it) => ({
        name: it.name.trim(),
        ...(it.desc.trim() ? { desc: it.desc.trim() } : {}),
        ...(it.price.trim() ? { price: it.price.trim() } : {}),
        ...(it.emoji.trim() ? { emoji: it.emoji.trim() } : {}),
        ...(it.badge.trim() ? { badge: it.badge.trim() } : {}),
        ...(it.image ? { image: it.image } : {}),
      })),
    }));

  const [cats, setCats] = useState<ECat[]>(() => fromMenu(initial));
  const [saved, setSaved] = useState(() => JSON.stringify(toMenu(fromMenu(initial))));
  const [isCustom, setIsCustom] = useState(custom);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [quick, setQuick] = useState<Record<string, string | undefined>>({});

  const current = useMemo(() => JSON.stringify(toMenu(cats)), [cats]); // eslint-disable-line react-hooks/exhaustive-deps
  const dirty = current !== saved;
  const total = cats.reduce((n, c) => n + c.items.length, 0);

  const setCat = (key: string, patch: Partial<ECat>) => setCats((cs) => cs.map((c) => (c.key === key ? { ...c, ...patch } : c)));
  const setItem = (ck: string, ik: string, patch: Partial<EItem>) =>
    setCats((cs) => cs.map((c) => (c.key === ck ? { ...c, items: c.items.map((it) => (it.key === ik ? { ...it, ...patch } : it)) } : c)));

  async function uploadPhoto(ck: string, ik: string, raw: File) {
    setUploading((u) => ({ ...u, [ik]: true }));
    setMsg(null);
    try {
      const { file } = await shrinkImage(raw, 1100);
      const fd = new FormData();
      fd.set("siteId", String(siteId));
      fd.set("image", file);
      const res = await (api ? api.upload(fd) : uploadMenuImageAction(fd));
      if (!res.ok || !res.url) throw new Error(res.message);
      setItem(ck, ik, { image: res.url });
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "آپلود ناموفق بود." });
    } finally {
      setUploading((u) => ({ ...u, [ik]: false }));
    }
  }

  async function save() {
    const emptyCat = cats.find((c) => !c.title.trim());
    if (emptyCat) {
      setCat(emptyCat.key, { open: true });
      return setMsg({ ok: false, text: "هر دسته باید یک عنوان داشته باشه." });
    }
    for (const c of cats) {
      const bad = c.items.find((it) => !it.name.trim());
      if (bad) {
        setCat(c.key, { open: true });
        return setMsg({ ok: false, text: `یکی از موردهای «${c.title}» اسم نداره.` });
      }
    }
    if (total === 0) return setMsg({ ok: false, text: "منو باید حداقل یک مورد داشته باشه." });
    setBusy(true);
    setMsg(null);
    const res = await (api ? api.save(current) : savePrivateSiteMenuAction(siteId, current));
    setBusy(false);
    setMsg({ ok: res.ok, text: res.message });
    if (res.ok) {
      setSaved(current);
      setIsCustom(true);
    }
  }

  async function reset() {
    if (!confirm("همه‌ی تغییرات منو پاک بشه و منوی اصلی قالب برگرده؟")) return;
    setBusy(true);
    const res = await (api ? api.reset() : resetPrivateSiteMenuAction(siteId));
    setBusy(false);
    setMsg({ ok: res.ok, text: res.message });
    if (res.ok) {
      // Reload the page data so the editor shows the template menu again.
      window.location.reload();
    }
  }

  function addQuick(ck: string) {
    const text = quick[ck] ?? "";
    // One item per line:  نام | قیمت | توضیح   (price and description optional)
    const rows = text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => l.split(/\s*[|،؛\t]\s*/));
    if (rows.length === 0) return;
    setCat(ck, {
      open: true,
      items: [
        ...(cats.find((c) => c.key === ck)?.items ?? []),
        ...rows.map(([name, price, desc]) => ({ key: uid(), name: name ?? "", desc: desc ?? "", price: price ?? "", emoji: "", badge: "", image: "" })),
      ],
    });
    setQuick((q) => ({ ...q, [ck]: undefined }));
  }

  return (
    <div className="mt-3 rounded-card border border-ink/[0.14] bg-canvas/40 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[13.5px] font-semibold">
            منوی سایت <span className="text-dim">· {fa(cats.length)} دسته، {fa(total)} مورد</span>
          </p>
          <p className="mt-0.5 text-[12px] text-dim">
            {isCustom ? "منوی شخصی‌سازی‌شده" : "منوی پیش‌فرض قالب"}
            {dirty && <span className="font-bold text-amber-600"> · تغییرات ذخیره‌نشده</span>}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={save}
            disabled={busy || !dirty}
            className="rounded-full bg-accent px-5 py-2 text-[13px] font-bold text-black transition hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-45"
          >
            {busy ? "در حال ذخیره..." : "ذخیره‌ی منو"}
          </button>
          <a
            href={`/preview/${token}#menu`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-ink/[0.18] px-4 py-2 text-[12.5px] font-semibold text-dim transition hover:border-accent hover:text-accent"
          >
            دیدن سایت
          </a>
          {isCustom && (
            <button
              type="button"
              onClick={reset}
              disabled={busy}
              className="rounded-full border border-red-500/30 px-4 py-2 text-[12.5px] font-semibold text-red-500/90 transition hover:bg-red-500/10 disabled:opacity-50"
            >
              بازگشت به منوی قالب
            </button>
          )}
        </div>
      </div>
      {msg && (
        <p className={`mb-3 text-[13px] font-semibold ${msg.ok ? "text-emerald-600" : "text-red-500"}`} role="status">
          {msg.text}
        </p>
      )}
      <p className="mb-3 text-[12px] leading-relaxed text-dim/80">
        قیمت رو همون‌طور که می‌خواید نمایش داده بشه بنویسید (مثلاً «۱۲۰,۰۰۰ تومان»)؛ اگه خالی بذارید قیمتی نمایش داده نمی‌شه. عکس هر مورد خودکار
        کم‌حجم می‌شه. تا «ذخیره‌ی منو» نزنید چیزی روی سایت عوض نمی‌شه.
      </p>

      <div className="space-y-3">
        {cats.map((c, ci) => (
          <section key={c.key} className="rounded-xl border border-ink/[0.14] bg-surface/20">
            <div className="flex flex-wrap items-center gap-2 p-3">
              <button type="button" onClick={() => setCat(c.key, { open: !c.open })} className={iconBtn} aria-label="باز و بسته کردن">
                {c.open ? "▾" : "◂"}
              </button>
              <input
                value={c.emoji}
                onChange={(e) => setCat(c.key, { emoji: e.target.value })}
                placeholder="🍽️"
                aria-label="ایموجی دسته"
                className={`${inputClass} !w-14 text-center`}
              />
              <input value={c.title} onChange={(e) => setCat(c.key, { title: e.target.value })} placeholder="عنوان دسته (مثلاً قهوه گرم)" className={`${inputClass} min-w-[9rem] flex-1`} />
              <span className="text-[12px] text-dim">{fa(c.items.length)} مورد</span>
              <button type="button" className={iconBtn} disabled={ci === 0} onClick={() => setCats((cs) => move(cs, ci, -1))} aria-label="بالا">
                ↑
              </button>
              <button type="button" className={iconBtn} disabled={ci === cats.length - 1} onClick={() => setCats((cs) => move(cs, ci, 1))} aria-label="پایین">
                ↓
              </button>
              <button
                type="button"
                className={`${iconBtn} hover:!border-red-500 hover:!text-red-500`}
                onClick={() => {
                  if (confirm(`دسته‌ی «${c.title || "بدون عنوان"}» با همه‌ی موردهاش حذف بشه؟`)) setCats((cs) => cs.filter((x) => x.key !== c.key));
                }}
                aria-label="حذف دسته"
              >
                ✕
              </button>
            </div>

            {c.open && (
              <div className="space-y-2.5 border-t border-ink/[0.1] p-3">
                {c.items.map((it, ii) => (
                  <div key={it.key} className="rounded-lg border border-ink/[0.12] bg-canvas/50 p-2.5">
                    <div className="flex items-start gap-2.5">
                      <PhotoBox
                        image={it.image}
                        emoji={it.emoji || c.emoji}
                        busy={!!uploading[it.key]}
                        onPick={(f) => void uploadPhoto(c.key, it.key, f)}
                        onClear={() => setItem(c.key, it.key, { image: "" })}
                      />
                      <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2">
                        <input value={it.name} onChange={(e) => setItem(c.key, it.key, { name: e.target.value })} placeholder="نام مورد *" className={`${inputClass} ${it.name.trim() ? "" : "!border-amber-500/60"}`} />
                        <input value={it.price} onChange={(e) => setItem(c.key, it.key, { price: e.target.value })} placeholder="قیمت (مثلاً ۱۲۰,۰۰۰ تومان)" className={inputClass} />
                        <input value={it.desc} onChange={(e) => setItem(c.key, it.key, { desc: e.target.value })} placeholder="توضیح کوتاه (اختیاری)" className={`${inputClass} sm:col-span-2`} />
                        <input value={it.emoji} onChange={(e) => setItem(c.key, it.key, { emoji: e.target.value })} placeholder="ایموجی (جای عکس)" className={inputClass} />
                        <input value={it.badge} onChange={(e) => setItem(c.key, it.key, { badge: e.target.value })} placeholder="برچسب (مثلاً محبوب)" className={inputClass} />
                      </div>
                      <div className="flex shrink-0 flex-col gap-1.5">
                        <button type="button" className={iconBtn} disabled={ii === 0} onClick={() => setCat(c.key, { items: move(c.items, ii, -1) })} aria-label="بالا">
                          ↑
                        </button>
                        <button type="button" className={iconBtn} disabled={ii === c.items.length - 1} onClick={() => setCat(c.key, { items: move(c.items, ii, 1) })} aria-label="پایین">
                          ↓
                        </button>
                        <button type="button" className={`${iconBtn} hover:!border-red-500 hover:!text-red-500`} onClick={() => setCat(c.key, { items: c.items.filter((x) => x.key !== it.key) })} aria-label="حذف مورد">
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setCat(c.key, { items: [...c.items, { key: uid(), name: "", desc: "", price: "", emoji: "", badge: "", image: "" }] })}
                    className="rounded-full border border-accent/40 px-4 py-1.5 text-[12.5px] font-bold text-accent transition hover:bg-accent hover:text-black"
                  >
                    + مورد جدید
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuick((q) => ({ ...q, [c.key]: q[c.key] === undefined ? "" : undefined }))}
                    className="rounded-full border border-ink/[0.2] px-4 py-1.5 text-[12.5px] font-semibold text-dim transition hover:border-accent hover:text-accent"
                  >
                    افزودن سریع (چند مورد با هم)
                  </button>
                </div>
                {quick[c.key] !== undefined && (
                  <div className="rounded-lg border border-accent/30 bg-canvas/40 p-3">
                    <p className="mb-1.5 text-[12px] text-dim">هر خط یک مورد: <b>نام | قیمت | توضیح</b> (قیمت و توضیح اختیاریه)</p>
                    <textarea
                      value={quick[c.key]}
                      onChange={(e) => setQuick((q) => ({ ...q, [c.key]: e.target.value }))}
                      rows={4}
                      placeholder={"اسپرسو | ۹۵,۰۰۰ تومان | یه شات غلیظ\nلاته | ۱۲۰,۰۰۰ تومان"}
                      className={`${inputClass} resize-y leading-relaxed`}
                    />
                    <button type="button" onClick={() => addQuick(c.key)} className="mt-2 rounded-full bg-accent px-4 py-1.5 text-[12.5px] font-bold text-black">
                      افزودن به دسته
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setCats((cs) => [...cs.map((c) => ({ ...c, open: false })), { key: uid(), title: "", emoji: "", open: true, items: [] }])}
        className="mt-3 rounded-full border border-accent/40 px-5 py-2 text-[13px] font-bold text-accent transition hover:bg-accent hover:text-black"
      >
        + دسته‌ی جدید
      </button>
    </div>
  );
}

/** The little photo square of a menu item: click (or drop) to upload, ✕ to remove. */
function PhotoBox({
  image,
  emoji,
  busy,
  onPick,
  onClear,
}: {
  image: string;
  emoji: string;
  busy: boolean;
  onPick: (f: File) => void;
  onClear: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => !busy && ref.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files?.[0];
          if (f && !busy) onPick(f);
        }}
        title="آپلود عکس"
        className="relative grid h-[76px] w-[76px] place-items-center overflow-hidden rounded-xl border-2 border-dashed border-ink/[0.2] bg-surface/40 text-[11px] text-dim transition hover:border-accent hover:text-accent"
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="px-1 text-center leading-tight">
            <span className="block text-[20px]">{emoji || "📷"}</span>عکس
          </span>
        )}
        {busy && (
          <span className="absolute inset-0 grid place-items-center bg-canvas/80">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          </span>
        )}
      </button>
      {image && !busy && (
        <button
          type="button"
          onClick={onClear}
          aria-label="حذف عکس"
          className="absolute -left-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-red-500 text-[10px] text-white shadow"
        >
          ✕
        </button>
      )}
      <input
        ref={ref}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (f) onPick(f);
        }}
      />
    </div>
  );
}
