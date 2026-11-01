import { db } from "@/lib/db/client";
import { recordAuditLog } from "./auditRepo";
import type { Actor } from "@/lib/auth/rbac";
export { SETTING_FIELDS, type SettingField } from "@/lib/settingsFields";

/**
 * ===== Settings (Prompt 11، بخش ۱۶) =====
 *
 * ذخیره‌سازی به‌صورت Key/Value ساده روی جدول `settings` (طبق Schema Prompt
 * 10). فهرست کلیدها در `lib/settingsFields.ts` است (جدا نگه داشته شده تا
 * Client Componentها بدون وابستگی به دیتابیس بتوانند آن را Import کنند).
 * مقدار پیش‌فرض هر کلید خالی است — هیچ مقدار جعلی از قبل پر نشده.
 */

export async function getAllSettings(): Promise<Record<string, string>> {
  const rows = await db.prepare("SELECT key, value FROM settings").all() as { key: string; value: string }[];
  const map: Record<string, string> = {};
  for (const row of rows) map[row.key] = row.value;
  return map;
}

export async function updateSettings(values: Record<string, string>, actor: Actor): Promise<void> {
  const before = await getAllSettings();
  const now = new Date().toISOString();
  const upsert = db.prepare("INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at");
  for (const [key, value] of Object.entries(values)) {
    await upsert.run(key, value, now);
  }
  await recordAuditLog(actor, "settings.update", "settings", null, before, values);
}
