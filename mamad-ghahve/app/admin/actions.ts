"use server";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { currentAdminId, loginAdmin, logoutAdmin } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/hash";
import { getSettings, setSettings, siteUrl } from "@/lib/settings";
import type { Order } from "@/lib/db";
import { toEnDigits } from "@/lib/format";
import { basalamCategories, basalamWhoAmI, pushAllToBasalam, pushProductToBasalam } from "@/lib/basalam";
import { gateway } from "@/lib/payments";
import { digipayDeliver } from "@/lib/payments/digipay";

export type AState = { error?: string; ok?: string };

function requireAdmin(): number {
  const id = currentAdminId();
  if (!id) redirect("/admin/login");
  return id;
}

const str = (fd: FormData, k: string, max = 2000) => String(fd.get(k) ?? "").trim().slice(0, max);
const int = (fd: FormData, k: string) => {
  const n = parseInt(toEnDigits(String(fd.get(k) ?? "")).replace(/[,٬،\s]/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
};
const bool = (fd: FormData, k: string) => (fd.get(k) ? 1 : 0);

import { UPLOAD_DIR } from "@/lib/paths";
const ALLOWED: Record<string, string> = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif", "image/avif": ".avif" };

/** ذخیره‌ی عکس آپلودشده؛ اسم فایل رو برمی‌گردونه یا null */
async function saveUpload(fd: FormData, key: string): Promise<string | null> {
  const f = fd.get(key);
  if (!f || typeof f === "string" || !(f as File).size) return null;
  const file = f as File;
  const ext = ALLOWED[file.type];
  if (!ext) throw new Error("فقط عکس JPG، PNG، WEBP، GIF یا AVIF مجازه.");
  if (file.size > 5 * 1024 * 1024) throw new Error("حجم عکس حداکثر ۵ مگابایت.");
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const name = crypto.randomBytes(10).toString("hex") + ext;
  fs.writeFileSync(path.join(UPLOAD_DIR, name), Buffer.from(await file.arrayBuffer()));
  return name;
}

function refreshStore() {
  revalidatePath("/", "layout");
}

/* ---------------- auth ---------------- */
export async function adminLoginAction(_: AState, fd: FormData): Promise<AState> {
  const u = str(fd, "username", 60);
  const p = String(fd.get("password") || "");
  const row = db().prepare("SELECT * FROM admins WHERE username = ?").get(u) as { id: number; password_hash: string } | undefined;
  if (!row || !verifyPassword(p, row.password_hash)) return { error: "نام کاربری یا رمز اشتباهه." };
  loginAdmin(row.id);
  redirect("/admin");
}

export async function adminLogoutAction() {
  logoutAdmin();
  redirect("/admin/login");
}

export async function adminPasswordAction(_: AState, fd: FormData): Promise<AState> {
  const id = requireAdmin();
  const cur = String(fd.get("current") || "");
  const np = String(fd.get("next") || "");
  const row = db().prepare("SELECT password_hash FROM admins WHERE id = ?").get(id) as { password_hash: string };
  if (!verifyPassword(cur, row.password_hash)) return { error: "رمز فعلی اشتباهه." };
  if (np.length < 8) return { error: "رمز جدید حداقل ۸ کاراکتر باشه." };
  db().prepare("UPDATE admins SET password_hash = ? WHERE id = ?").run(hashPassword(np), id);
  return { ok: "رمز عوض شد ✓" };
}

/* ---------------- products ---------------- */
export async function saveProductAction(_: AState, fd: FormData): Promise<AState> {
  requireAdmin();
  const id = int(fd, "id");
  const name = str(fd, "name", 150);
  const price = int(fd, "price");
  if (name.length < 2) return { error: "اسم محصول رو بنویس." };
  if (price <= 0) return { error: "قیمت معتبر وارد کن." };
  let image = str(fd, "image_url", 500);
  try {
    const up = await saveUpload(fd, "image_file");
    if (up) image = up;
  } catch (e) {
    return { error: (e as Error).message };
  }
  if (fd.get("remove_image")) image = "";
  const catId = int(fd, "category_id") || null;
  const vals = [
    name,
    catId,
    str(fd, "short_desc", 200),
    str(fd, "description", 5000),
    price,
    int(fd, "compare_price"),
    int(fd, "stock"),
    int(fd, "weight") || 250,
    str(fd, "options", 500).replace(/،/g, ","),
    image,
    /^#[0-9a-f]{6}$/i.test(str(fd, "color")) ? str(fd, "color") : "#6b3f26",
    str(fd, "badge", 30),
    bool(fd, "is_active"),
    bool(fd, "is_featured"),
  ];
  let pid = id;
  if (id) {
    db()
      .prepare(
        `UPDATE products SET name=?, category_id=?, short_desc=?, description=?, price=?, compare_price=?, stock=?, weight=?, options=?, image=?, color=?, badge=?, is_active=?, is_featured=?, updated_at=datetime('now') WHERE id=?`
      )
      .run(...vals, id);
  } else {
    const r = db()
      .prepare(
        `INSERT INTO products (name, category_id, short_desc, description, price, compare_price, stock, weight, options, image, color, badge, is_active, is_featured) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
      )
      .run(...vals);
    pid = Number(r.lastInsertRowid);
  }
  refreshStore();
  if (id) {
    revalidatePath(`/admin/products/${id}`);
    return { ok: "ذخیره شد ✓" };
  }
  redirect(`/admin/products/${pid}?saved=1`);
}

export async function deleteProductAction(fd: FormData) {
  requireAdmin();
  db().prepare("DELETE FROM products WHERE id = ?").run(int(fd, "id"));
  refreshStore();
  redirect("/admin/products?deleted=1");
}

export async function toggleProductAction(fd: FormData) {
  requireAdmin();
  db().prepare("UPDATE products SET is_active = 1 - is_active WHERE id = ?").run(int(fd, "id"));
  refreshStore();
}

export async function quickStockAction(fd: FormData) {
  requireAdmin();
  db().prepare("UPDATE products SET stock = ?, price = ? WHERE id = ?").run(Math.max(0, int(fd, "stock")), Math.max(1, int(fd, "price")), int(fd, "id"));
  refreshStore();
}

/* ---------------- categories ---------------- */
export async function saveCategoryAction(fd: FormData) {
  requireAdmin();
  const id = int(fd, "id");
  const name = str(fd, "name", 60);
  const slug = str(fd, "slug", 60).toLowerCase().replace(/[^a-z0-9-]/g, "-") || "cat-" + Date.now();
  const icon = str(fd, "icon", 8) || "☕";
  const sort = int(fd, "sort");
  if (!name) return;
  if (id) db().prepare("UPDATE categories SET name=?, slug=?, icon=?, sort=? WHERE id=?").run(name, slug, icon, sort, id);
  else db().prepare("INSERT OR IGNORE INTO categories (name, slug, icon, sort) VALUES (?,?,?,?)").run(name, slug, icon, sort);
  refreshStore();
}

export async function deleteCategoryAction(fd: FormData) {
  requireAdmin();
  db().prepare("DELETE FROM categories WHERE id = ?").run(int(fd, "id"));
  refreshStore();
}

/* ---------------- slides ---------------- */
export async function saveSlideAction(fd: FormData) {
  requireAdmin();
  const id = int(fd, "id");
  let image = str(fd, "image_url", 500);
  const up = await saveUpload(fd, "image_file").catch(() => null);
  if (up) image = up;
  if (fd.get("remove_image")) image = "";
  const v = [str(fd, "title", 120), str(fd, "subtitle", 300), str(fd, "button_text", 40), str(fd, "button_link", 200) || "/shop", image, str(fd, "bg", 7) || "#3b2316", str(fd, "emoji", 8) || "☕", int(fd, "sort"), bool(fd, "is_active")];
  if (!v[0]) return;
  if (id) db().prepare("UPDATE slides SET title=?, subtitle=?, button_text=?, button_link=?, image=?, bg=?, emoji=?, sort=?, is_active=? WHERE id=?").run(...v, id);
  else db().prepare("INSERT INTO slides (title, subtitle, button_text, button_link, image, bg, emoji, sort, is_active) VALUES (?,?,?,?,?,?,?,?,?)").run(...v);
  refreshStore();
}

export async function deleteSlideAction(fd: FormData) {
  requireAdmin();
  db().prepare("DELETE FROM slides WHERE id = ?").run(int(fd, "id"));
  refreshStore();
}

/* ---------------- coupons ---------------- */
export async function saveCouponAction(fd: FormData) {
  requireAdmin();
  const code = str(fd, "code", 30).toUpperCase().replace(/\s/g, "");
  if (!code) return;
  const type = fd.get("type") === "amount" ? "amount" : "percent";
  db()
    .prepare(
      `INSERT INTO coupons (code, type, value, min_total, max_uses, club_only, is_active, expires_at) VALUES (?,?,?,?,?,?,1,?)
       ON CONFLICT(code) DO UPDATE SET type=excluded.type, value=excluded.value, min_total=excluded.min_total, max_uses=excluded.max_uses, club_only=excluded.club_only, expires_at=excluded.expires_at`
    )
    .run(code, type, int(fd, "value"), int(fd, "min_total"), int(fd, "max_uses"), bool(fd, "club_only"), str(fd, "expires_at", 10));
  revalidatePath("/admin/coupons");
}

export async function toggleCouponAction(fd: FormData) {
  requireAdmin();
  db().prepare("UPDATE coupons SET is_active = 1 - is_active WHERE id = ?").run(int(fd, "id"));
  revalidatePath("/admin/coupons");
}

export async function deleteCouponAction(fd: FormData) {
  requireAdmin();
  db().prepare("DELETE FROM coupons WHERE id = ?").run(int(fd, "id"));
  revalidatePath("/admin/coupons");
}

/* ---------------- orders ---------------- */
const STATUSES = ["pending", "paid", "processing", "shipped", "delivered", "cancelled", "failed"];

export async function updateOrderAction(_: AState, fd: FormData): Promise<AState> {
  requireAdmin();
  const id = int(fd, "id");
  const status = String(fd.get("status") || "");
  const before = db().prepare("SELECT * FROM orders WHERE id = ?").get(id) as Order | undefined;
  if (!before) return { error: "سفارش پیدا نشد." };
  if (STATUSES.includes(status) && status !== before.status) {
    if (status === "paid") {
      // ثبت دستی پرداخت (مثلاً کارت‌به‌کارت) همون منطق امتیاز و موجودی رو اجرا می‌کنه
      const { markPaid } = await import("@/lib/orders");
      markPaid(id, "MANUAL");
    } else {
      db().prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, id);
    }
  }
  db().prepare("UPDATE orders SET tracking_code = ? WHERE id = ?").run(str(fd, "tracking_code", 60), id);

  // دیجی‌پی اعتباری/اقساطی: بعد از ارسال، تحویل باید به دیجی‌پی اعلام بشه (یک بار)
  let note = "";
  let meta: Record<string, unknown> = {};
  try {
    meta = JSON.parse(before.payment_meta || "{}") || {};
  } catch {}
  if ((status === "shipped" || status === "delivered") && before.payment_provider === "digipay" && before.payment_ref && !meta.delivered) {
    const { orderItems } = await import("@/lib/orders");
    const r = await digipayDeliver(before, orderItems(id), getSettings());
    if (r.ok && r.message) {
      db().prepare("UPDATE orders SET payment_meta = ? WHERE id = ?").run(JSON.stringify({ ...meta, delivered: true }), id);
      note = " " + r.message;
    } else if (!r.ok) {
      revalidatePath(`/admin/orders/${id}`);
      return { error: "وضعیت ذخیره شد ولی " + r.message };
    }
  }
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/orders");
  return { ok: "ذخیره شد ✓" + note };
}

/* ---------------- تست اتصال درگاه‌ها و باسلام ---------------- */
export async function testGatewayAction(_: AState, fd: FormData): Promise<AState> {
  requireAdmin();
  const gw = gateway(String(fd.get("gateway") || ""));
  if (!gw?.test) return { error: "این درگاه تست اتصال نداره." };
  const r = await gw.test(getSettings(), `${siteUrl()}/api/payment/callback/${gw.id}`);
  return r.ok ? { ok: "✅ " + r.message } : { error: "❌ " + r.message };
}

export async function basalamTestAction(_: AState, _fd: FormData): Promise<AState> {
  requireAdmin();
  const r = await basalamWhoAmI();
  if (r.ok && r.vendorId) {
    const s = getSettings();
    if (!s.basalam_vendor_id) {
      setSettings({ basalam_vendor_id: r.vendorId });
      revalidatePath("/admin/settings");
      return { ok: "✅ " + r.message + " شناسه‌ی غرفه خودکار ذخیره شد." };
    }
    if (s.basalam_vendor_id !== r.vendorId) return { error: `⚠️ ${r.message} ولی شناسه‌ی غرفه تو تنظیمات (${s.basalam_vendor_id}) با این فرق داره.` };
  }
  return r.ok ? { ok: "✅ " + r.message } : { error: "❌ " + r.message };
}

export async function basalamCategoryAction(_: AState, fd: FormData): Promise<AState> {
  requireAdmin();
  const q = str(fd, "q", 60);
  const list = await basalamCategories(q);
  if (!list.length) return { error: "دسته‌ای پیدا نشد (یا اتصال برقرار نیست)." };
  return { ok: list.map((c) => `${c.id} — ${c.path}`).join("\n") };
}

/* ---------------- customers ---------------- */
export async function adjustPointsAction(fd: FormData) {
  requireAdmin();
  const id = int(fd, "id");
  const amount = parseInt(toEnDigits(String(fd.get("amount") || "0")), 10) || 0;
  if (!amount) return;
  db().prepare("UPDATE customers SET points = MAX(0, points + ?) WHERE id = ?").run(amount, id);
  db().prepare("INSERT INTO point_logs (customer_id, amount, reason) VALUES (?, ?, ?)").run(id, amount, str(fd, "reason", 100) || "تغییر دستی توسط مدیر");
  revalidatePath("/admin/customers");
}

/* ---------------- settings ---------------- */
const SETTING_KEYS = [
  "shop_name", "shop_tagline", "shop_phone", "shop_address", "instagram", "shipping_fee", "free_shipping_over",
  "club_earn_per", "club_point_value", "club_welcome_points", "club_max_redeem_percent",
  "zarinpal_merchant", "snappay_base_url", "snappay_client_id", "snappay_client_secret", "snappay_username", "snappay_password",
  "digipay_base_url", "digipay_client_id", "digipay_client_secret", "digipay_username", "digipay_password", "digipay_ticket_type",
  "basalam_token", "basalam_vendor_id", "basalam_category_id", "basalam_base_url", "basalam_unit_type", "basalam_preparation_days", "basalam_price_unit",
];
const SETTING_FLAGS = ["pay_mock_enabled", "zarinpal_enabled", "zarinpal_sandbox", "snappay_enabled", "digipay_enabled"];
const NUMERIC = ["shipping_fee", "free_shipping_over", "club_earn_per", "club_point_value", "club_welcome_points", "club_max_redeem_percent"];

export async function saveSettingsAction(_: AState, fd: FormData): Promise<AState> {
  requireAdmin();
  const section = String(fd.get("_section") || "");
  const out: Record<string, string> = {};
  for (const k of SETTING_KEYS) {
    if (!fd.has(k)) continue;
    let v = str(fd, k, 2000);
    if (NUMERIC.includes(k)) v = String(int(fd, k));
    // فیلد رمز خالی یعنی «تغییر نده»
    if (/(secret|password|token)$/.test(k) && v === "") continue;
    out[k] = v;
  }
  for (const k of SETTING_FLAGS) if (fd.has("_flag_" + k)) out[k] = fd.get(k) ? "1" : "0";
  setSettings(out);
  refreshStore();
  return { ok: `تنظیمات ${section} ذخیره شد ✓` };
}

/* ---------------- basalam ---------------- */
export async function basalamPushAction(_: AState, fd: FormData): Promise<AState> {
  requireAdmin();
  const id = int(fd, "id");
  if (id) {
    const r = await pushProductToBasalam(id);
    revalidatePath(`/admin/products/${id}`);
    return r.ok ? { ok: r.message } : { error: r.message };
  }
  const r = await pushAllToBasalam();
  revalidatePath("/admin/products");
  return r.fail ? { error: `${r.ok} موفق، ${r.fail} ناموفق. ${r.errors.join(" | ")}` } : { ok: `${r.ok} محصول با باسلام همگام شد.` };
}
