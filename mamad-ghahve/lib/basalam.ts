import "server-only";
import { db, type Product } from "./db";
import { getSettings } from "./settings";

/**
 * اتصال به غرفه‌ی باسلام: ارسال/به‌روزرسانی محصولات سایت در غرفه.
 * توکن: از developers.basalam.com یک «توکن دسترسی شخصی» با دسترسی vendor.product.write بگیر.
 * شناسه‌ی غرفه (vendor id) و شناسه‌ی دسته‌بندی باسلام رو هم از پنل باسلام بردار.
 * مسیرها طبق API نسخه‌ی ۳ باسلام (core.basalam.com) نوشته شده؛ اگه نسخه‌ی API عوض شد فقط اینجا رو تغییر بده.
 */
export type BasalamResult = { ok: boolean; message: string; id?: string };

function cfg() {
  const s = getSettings();
  return {
    base: (s.basalam_base_url || "https://core.basalam.com").replace(/\/$/, ""),
    token: s.basalam_token,
    vendor: s.basalam_vendor_id,
    category: s.basalam_category_id,
  };
}

export function basalamReady(): boolean {
  const c = cfg();
  return !!(c.token && c.vendor && c.category);
}

function payload(p: Product, category: string) {
  return {
    name: p.name,
    category_id: Number(category),
    description: [p.short_desc, p.description].filter(Boolean).join("\n\n"),
    primary_price: p.price * 10, // ریال
    stock: p.stock,
    weight: p.weight,
    package_weight: p.weight + 50,
    preparation_days: 2,
  };
}

export async function pushProductToBasalam(productId: number): Promise<BasalamResult> {
  const c = cfg();
  if (!basalamReady()) return { ok: false, message: "اول توکن، شناسه‌ی غرفه و دسته‌بندی باسلام رو تو تنظیمات وارد کن." };
  const p = db().prepare("SELECT * FROM products WHERE id = ?").get(productId) as Product | undefined;
  if (!p) return { ok: false, message: "محصول پیدا نشد." };

  const isUpdate = !!p.basalam_id;
  const url = isUpdate ? `${c.base}/v3/products/${p.basalam_id}` : `${c.base}/v3/vendors/${c.vendor}/products`;
  try {
    const res = await fetch(url, {
      method: isUpdate ? "PATCH" : "POST",
      headers: { Authorization: `Bearer ${c.token}`, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload(p, c.category)),
      cache: "no-store",
    });
    const j: any = await res.json().catch(() => null);
    if (!res.ok) {
      const msg = j?.messages?.[0]?.message || j?.message || `HTTP ${res.status}`;
      return { ok: false, message: `باسلام خطا داد: ${msg}` };
    }
    const id = String(j?.id ?? j?.data?.id ?? p.basalam_id ?? "");
    if (id && !isUpdate) db().prepare("UPDATE products SET basalam_id = ? WHERE id = ?").run(id, p.id);
    return { ok: true, id, message: isUpdate ? "محصول تو باسلام به‌روز شد." : "محصول تو غرفه‌ی باسلام ساخته شد (عکس رو از پنل باسلام اضافه کن)." };
  } catch {
    return { ok: false, message: "ارتباط با باسلام برقرار نشد." };
  }
}

export async function pushAllToBasalam(): Promise<{ ok: number; fail: number; errors: string[] }> {
  const ids = db().prepare("SELECT id, name FROM products WHERE is_active = 1").all() as { id: number; name: string }[];
  let ok = 0, fail = 0;
  const errors: string[] = [];
  for (const { id, name } of ids) {
    const r = await pushProductToBasalam(id);
    if (r.ok) ok++;
    else {
      fail++;
      errors.push(`${name}: ${r.message}`);
      if (!basalamReady()) break;
    }
  }
  return { ok, fail, errors: errors.slice(0, 10) };
}
