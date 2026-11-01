import { db } from "@/lib/db/client";
import { recordAuditLog } from "./auditRepo";
import type { Actor } from "@/lib/auth/rbac";

/**
 * ===== مدیریت شعب (Prompt 11، بخش ۷) =====
 *
 * طبق دستور صریح: «آدرس و مختصات فعلاً TODO هستند و نباید مقدار جعلی وارد
 * شود» — این ریپازیتوری هرگز مقداری برای `lat`/`lng`/آدرس دقیق نمی‌سازد؛
 * فقط تنظیمات عملیاتی واقعی (که در Prompt 1 داده شده بودند) قابل ویرایش‌اند.
 */

export interface BranchAdminRow {
  id: string;
  slug: string;
  name: string;
  city: string;
  address: string | null;
  phone: string | null;
  openingHours: string;
  hasCafeService: boolean;
  hasPos: boolean;
  supportsCashOnDelivery: boolean;
  // ⚠️ اطلاعات داخلی — فقط پشت Permission «branches.manage» (همین فایل و
  // API مربوطه) قابل خواندن است؛ هرگز نباید به هیچ Endpoint/صفحه عمومی راه پیدا کند.
  managerName: string | null;
  managerPhone: string | null;
  isActive: boolean;
  lat: number | null;
  lng: number | null;
  serviceRadiusKm: number | null;
}

interface BranchRow {
  id: string;
  slug: string;
  name: string;
  city: string;
  address: string | null;
  phone: string | null;
  opening_hours: string;
  has_cafe_service: number;
  has_pos: number;
  supports_cash_on_delivery: number;
  manager_name: string | null;
  manager_phone: string | null;
  is_active: number;
  lat: number | null;
  lng: number | null;
  service_radius_km: number | null;
}

function rowToBranch(row: BranchRow): BranchAdminRow {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    city: row.city,
    address: row.address,
    phone: row.phone,
    openingHours: row.opening_hours,
    hasCafeService: !!row.has_cafe_service,
    hasPos: !!row.has_pos,
    supportsCashOnDelivery: !!row.supports_cash_on_delivery,
    managerName: row.manager_name,
    managerPhone: row.manager_phone,
    isActive: !!row.is_active,
    lat: row.lat,
    lng: row.lng,
    serviceRadiusKm: row.service_radius_km,
  };
}

export async function listBranchesAdmin(): Promise<BranchAdminRow[]> {
  const rows = await db.prepare("SELECT * FROM branches ORDER BY name").all() as BranchRow[];
  return rows.map(rowToBranch);
}

export async function getBranchAdmin(id: string): Promise<BranchAdminRow | undefined> {
  const row = await db.prepare("SELECT * FROM branches WHERE id = ?").get(id) as BranchRow | undefined;
  return row ? rowToBranch(row) : undefined;
}

export interface BranchUpdateInput {
  address: string | null;
  phone: string | null;
  openingHours: string;
  hasCafeService: boolean;
  hasPos: boolean;
  supportsCashOnDelivery: boolean;
  managerName: string | null;
  managerPhone: string | null;
  isActive: boolean;
}

export async function updateBranchOperationalSettings(id: string, input: BranchUpdateInput, actor: Actor): Promise<void> {
  const before = await getBranchAdmin(id);
  await db.prepare(
    `UPDATE branches SET address = ?, phone = ?, opening_hours = ?, has_cafe_service = ?, has_pos = ?,
      supports_cash_on_delivery = ?, manager_name = ?, manager_phone = ?, is_active = ? WHERE id = ?`,
  ).run(
    input.address,
    input.phone,
    input.openingHours,
    input.hasCafeService ? 1 : 0,
    input.hasPos ? 1 : 0,
    input.supportsCashOnDelivery ? 1 : 0,
    input.managerName,
    input.managerPhone,
    input.isActive ? 1 : 0,
    id,
  );
  // ⚠️ Audit Log این تغییر را هم ثبت می‌کند — یعنی شماره تماس مدیر در
  // audit_logs (که خودش فقط برای ادمین‌های واقعی قابل مشاهده است، رجوع به
  // app/admin/(protected)/audit-logs) خواهد بود. این عمدی و قابل قبول است
  // (سابقه تغییرات داخلی ادمین)، نه انتشار عمومی.
  await recordAuditLog(actor, "branch.update_settings", "branch", id, before ?? null, input);
}
