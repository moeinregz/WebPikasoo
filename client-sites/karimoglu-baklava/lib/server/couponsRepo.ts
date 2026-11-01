import { randomUUID } from "crypto";
import { db } from "@/lib/db/client";
import { recordAuditLog } from "./auditRepo";
import type { Actor } from "@/lib/auth/rbac";

/**
 * ===== Coupon / Discount / Campaign (Prompt 11، بخش ۱۲) =====
 *
 * طبق گزارش پایانی Prompt 10: این بخش فقط تا سطح Schema + CRUD مدیریتی
 * ساخته شده بود. اینجا CRUD واقعی روی همان جدول‌ها اضافه می‌شود. ⚠️ اتصال
 * این کدها به Checkout واقعی (اعمال کد تخفیف هنگام پرداخت) هنوز انجام
 * نشده — طبق صداقت گزارش قبلی، این هنوز مرحله بعد است؛ آنچه اینجا اضافه
 * می‌شود صرفاً امکان «تعریف» کوپن/کمپین از پنل مدیریت است.
 */

export interface CampaignInput {
  name: string;
  description: string | null;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
}

export interface CampaignRow extends CampaignInput {
  id: string;
}

export async function listCampaigns(): Promise<CampaignRow[]> {
  const rows = await db.prepare("SELECT * FROM campaigns ORDER BY starts_at DESC NULLS LAST").all() as {
    id: string;
    name: string;
    description: string | null;
    starts_at: string | null;
    ends_at: string | null;
    is_active: number;
  }[];
  return rows.map((r) => ({ id: r.id, name: r.name, description: r.description, startsAt: r.starts_at, endsAt: r.ends_at, isActive: !!r.is_active }));
}

export async function createCampaign(input: CampaignInput, actor: Actor): Promise<string> {
  const id = randomUUID();
  await db.prepare("INSERT INTO campaigns (id, name, description, starts_at, ends_at, is_active) VALUES (?, ?, ?, ?, ?, ?)").run(
    id,
    input.name,
    input.description,
    input.startsAt,
    input.endsAt,
    input.isActive ? 1 : 0,
  );
  await recordAuditLog(actor, "campaign.create", "campaign", id, null, input);
  return id;
}

export interface CouponInput {
  code: string;
  campaignId: string | null;
  percent: number | null;
  amount: number | null;
  minOrderAmount: number | null;
  maxUses: number | null;
  perUserLimit: number | null;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
}

export interface CouponRow extends CouponInput {
  id: string;
  usedCount: number;
}

export async function listCoupons(): Promise<CouponRow[]> {
  const rows = await db.prepare("SELECT * FROM coupons ORDER BY created_at DESC NULLS LAST, code ASC").all() as {
    id: string;
    code: string;
    campaign_id: string | null;
    percent: number | null;
    amount: number | null;
    max_uses: number | null;
    used_count: number;
    per_user_limit: number | null;
    min_order_amount: number | null;
    starts_at: string | null;
    ends_at: string | null;
    is_active: number;
  }[];
  return rows.map((r) => ({
    id: r.id,
    code: r.code,
    campaignId: r.campaign_id,
    percent: r.percent,
    amount: r.amount,
    minOrderAmount: r.min_order_amount,
    maxUses: r.max_uses,
    usedCount: r.used_count,
    perUserLimit: r.per_user_limit,
    startsAt: r.starts_at,
    endsAt: r.ends_at,
    isActive: !!r.is_active,
  }));
}

export async function createCoupon(input: CouponInput, actor: Actor): Promise<{ success: true; id: string } | { success: false; error: string }> {
  if (!input.code.trim()) return { success: false, error: "کد تخفیف الزامی است." };
  if (!input.percent && !input.amount) return { success: false, error: "باید یا درصد تخفیف یا مبلغ ثابت تعیین شود." };

  const id = randomUUID();
  try {
    await db.prepare(
      `INSERT INTO coupons (id, code, campaign_id, percent, amount, max_uses, used_count, per_user_limit, min_order_amount, starts_at, ends_at, is_active, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?)`,
    ).run(
      id,
      input.code.toUpperCase(),
      input.campaignId,
      input.percent,
      input.amount,
      input.maxUses,
      input.perUserLimit,
      input.minOrderAmount,
      input.startsAt,
      input.endsAt,
      input.isActive ? 1 : 0,
      new Date().toISOString(),
    );
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "این کد تخفیف قبلاً استفاده شده است." };
  }
  await recordAuditLog(actor, "coupon.create", "coupon", id, null, input);
  return { success: true, id };
}

export async function setCouponActive(id: string, isActive: boolean, actor: Actor): Promise<void> {
  await db.prepare("UPDATE coupons SET is_active = ? WHERE id = ?").run(isActive ? 1 : 0, id);
  await recordAuditLog(actor, isActive ? "coupon.activate" : "coupon.deactivate", "coupon", id, null, { isActive });
}
