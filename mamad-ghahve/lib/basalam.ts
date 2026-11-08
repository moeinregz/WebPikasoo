import "server-only";
import fs from "fs";
import path from "path";
import { db, type Product } from "./db";
import { getSettings } from "./settings";

/**
 * اتصال به غرفه‌ی باسلام (API عمومی: https://openapi.basalam.com/v1 — مطابق SDK رسمی باسلام)
 *
 *  توکن: از developers.basalam.com/panel/tokens یک «توکن دسترسی شخصی» بساز (دسترسی vendor.product.write و vendor.product.read).
 *  ساخت محصول:   POST  /v1/vendors/{vendor_id}/products   (JSON)
 *  ویرایش:       PATCH /v1/products/{product_id}           (JSON، فقط فیلدهای ارسالی عوض می‌شن)
 *  آپلود عکس:    POST  /v1/files  (multipart: file + file_type=product.photo) → id عکس رو در photo می‌ذاریم
 *  اطلاعات من:   GET   /v1/users/me  → vendor.id
 *  دسته‌ها:       GET   /v1/categories
 *  وضعیت محصول: 2976 = منتشرشده، 3790 = منتشرنشده
 */
export type BasalamResult = { ok: boolean; message: string; id?: string };

const STATUS_PUBLISHED = 2976;
const STATUS_UNPUBLISHED = 3790;
const UPLOAD_DIR = path.resolve(process.cwd(), "data/uploads");

function cfg() {
  const s = getSettings();
  return {
    base: (s.basalam_base_url || "https://openapi.basalam.com").trim().replace(/\/+$/, "").replace(/\/v1$/, ""),
    token: (s.basalam_token || "").trim(),
    vendor: (s.basalam_vendor_id || "").trim(),
    category: (s.basalam_category_id || "").trim(),
    unitType: Number(s.basalam_unit_type || 6304),
    prepDays: Number(s.basalam_preparation_days || 2),
    priceMul: s.basalam_price_unit === "toman" ? 1 : 10,
  };
}

export function basalamReady(): boolean {
  const c = cfg();
  return !!(c.token && c.vendor && c.category);
}

async function api(method: string, url: string, body?: unknown, extra: RequestInit = {}) {
  const c = cfg();
  const res = await fetch(c.base + url, {
    method,
    headers: { Authorization: `Bearer ${c.token}`, Accept: "application/json", ...(body !== undefined ? { "Content-Type": "application/json" } : {}) },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
    ...extra,
  });
  const json: any = await res.json().catch(() => null);
  return { ok: res.ok, status: res.status, json };
}

function errorText(j: any, status: number): string {
  if (status === 401) return "توکن باسلام نامعتبر یا منقضی شده.";
  if (status === 403) return "توکن دسترسی لازم (vendor.product.write) رو نداره یا این غرفه مال شما نیست.";
  const m = j?.messages?.[0]?.message || j?.message || j?.detail || (j?.errors ? JSON.stringify(j.errors) : "");
  return m ? String(m) : `HTTP ${status}`;
}

/** آپلود عکس محصول در باسلام؛ id فایل رو برمی‌گردونه */
async function uploadPhoto(image: string): Promise<number | null> {
  const c = cfg();
  let buf: Buffer | null = null;
  let name = "product.jpg";
  let type = "image/jpeg";
  if (/^https?:\/\//.test(image)) {
    const r = await fetch(image, { cache: "no-store" }).catch(() => null);
    if (!r || !r.ok) return null;
    buf = Buffer.from(await r.arrayBuffer());
    type = r.headers.get("content-type") || type;
    name = path.basename(new URL(image).pathname) || name;
  } else if (image && !image.startsWith("/")) {
    const file = path.join(UPLOAD_DIR, path.basename(image));
    if (!fs.existsSync(file)) return null;
    buf = fs.readFileSync(file);
    name = path.basename(file);
    const ext = path.extname(file).toLowerCase();
    type = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : ext === ".gif" ? "image/gif" : "image/jpeg";
  }
  if (!buf) return null;
  const form = new FormData();
  form.set("file", new Blob([new Uint8Array(buf)], { type }), name);
  form.set("file_type", "product.photo");
  const res = await fetch(c.base + "/v1/files", { method: "POST", headers: { Authorization: `Bearer ${c.token}`, Accept: "application/json" }, body: form, cache: "no-store" });
  const j: any = await res.json().catch(() => null);
  return res.ok && j?.id ? Number(j.id) : null;
}

function payload(p: Product) {
  const c = cfg();
  const desc = [p.short_desc, p.description, p.options ? `گزینه‌ها: ${p.options.split(",").join("، ")}` : ""].filter(Boolean).join("\n\n");
  return {
    name: p.name.slice(0, 120),
    brief: (p.short_desc || "").slice(0, 200) || undefined,
    description: desc,
    category_id: Number(c.category),
    primary_price: p.price * c.priceMul,
    stock: Math.max(0, p.stock),
    weight: p.weight,
    package_weight: p.weight + 50,
    preparation_days: c.prepDays,
    unit_type: c.unitType,
    unit_quantity: 1,
    status: p.is_active ? STATUS_PUBLISHED : STATUS_UNPUBLISHED,
  };
}

export async function pushProductToBasalam(productId: number): Promise<BasalamResult> {
  const c = cfg();
  if (!basalamReady()) return { ok: false, message: "اول توکن، شناسه‌ی غرفه و شناسه‌ی دسته‌بندی باسلام رو تو تنظیمات وارد کن." };
  const p = db().prepare("SELECT * FROM products WHERE id = ?").get(productId) as Product | undefined;
  if (!p) return { ok: false, message: "محصول پیدا نشد." };

  const body: Record<string, unknown> = payload(p);

  // عکس: فقط وقتی عوض شده دوباره آپلود می‌شه
  let photoNote = "";
  const [photoFor, photoId] = (p.basalam_photo || "").split("|");
  if (p.image) {
    if (photoFor === p.image && photoId) body.photo = Number(photoId);
    else {
      const id = await uploadPhoto(p.image).catch(() => null);
      if (id) {
        body.photo = id;
        db().prepare("UPDATE products SET basalam_photo = ? WHERE id = ?").run(`${p.image}|${id}`, p.id);
      } else photoNote = " (آپلود عکس انجام نشد؛ از پنل باسلام اضافه‌ش کن)";
    }
  } else if (!p.basalam_id) photoNote = " (محصول عکس نداره؛ باسلام معمولاً برای انتشار عکس می‌خواد)";

  const isUpdate = !!p.basalam_id;
  const r = isUpdate ? await api("PATCH", `/v1/products/${encodeURIComponent(p.basalam_id)}`, body) : await api("POST", `/v1/vendors/${encodeURIComponent(c.vendor)}/products`, body);
  if (!r.ok) return { ok: false, message: `باسلام خطا داد: ${errorText(r.json, r.status)}` };
  const id = String(r.json?.id ?? r.json?.data?.id ?? p.basalam_id ?? "");
  if (id && !isUpdate) db().prepare("UPDATE products SET basalam_id = ? WHERE id = ?").run(id, p.id);
  return { ok: true, id, message: (isUpdate ? "محصول تو باسلام به‌روز شد." : "محصول تو غرفه‌ی باسلام ساخته شد.") + photoNote };
}

export async function pushAllToBasalam(): Promise<{ ok: number; fail: number; errors: string[] }> {
  const ids = db().prepare("SELECT id, name FROM products WHERE is_active = 1").all() as { id: number; name: string }[];
  let ok = 0,
    fail = 0;
  const errors: string[] = [];
  for (const { id, name } of ids) {
    const r = await pushProductToBasalam(id);
    if (r.ok) ok++;
    else {
      fail++;
      errors.push(`${name}: ${r.message}`);
      if (/توکن|دسترسی/.test(r.message)) break; // خطای اتصال: ادامه دادن فایده نداره
    }
  }
  return { ok, fail, errors: errors.slice(0, 10) };
}

/** تست اتصال: توکن رو چک می‌کنه و شناسه‌ی غرفه رو برمی‌گردونه */
export async function basalamWhoAmI(): Promise<{ ok: boolean; message: string; vendorId?: string; vendorName?: string }> {
  if (!cfg().token) return { ok: false, message: "توکن باسلام وارد نشده." };
  try {
    const r = await api("GET", "/v1/users/me");
    if (!r.ok) return { ok: false, message: errorText(r.json, r.status) };
    const v = r.json?.vendor;
    if (!v?.id) return { ok: true, message: `توکن معتبره (${r.json?.name || "کاربر"}) ولی این حساب غرفه نداره.` };
    return { ok: true, vendorId: String(v.id), vendorName: v.title || v.name || "", message: `اتصال برقراره: غرفه‌ی «${v.title || v.name || v.id}» (شناسه ${v.id}).` };
  } catch {
    return { ok: false, message: "ارتباط با باسلام برقرار نشد." };
  }
}

export type BasalamCategory = { id: number; title: string; path: string };

/** دسته‌بندی‌های باسلام (مسطح شده) برای پیدا کردن شناسه‌ی دسته */
export async function basalamCategories(query = ""): Promise<BasalamCategory[]> {
  const r = await api("GET", "/v1/categories").catch(() => null);
  const out: BasalamCategory[] = [];
  const walk = (list: any[], prefix: string) => {
    for (const c of list || []) {
      const p = prefix ? `${prefix} › ${c.title}` : c.title;
      out.push({ id: c.id, title: c.title, path: p });
      walk(c.children, p);
    }
  };
  walk(r?.json?.data || [], "");
  const q = query.trim();
  return (q ? out.filter((c) => c.path.includes(q)) : out).slice(0, 40);
}
