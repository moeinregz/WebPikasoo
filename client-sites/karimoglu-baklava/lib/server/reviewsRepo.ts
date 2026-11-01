import { db } from "@/lib/db/client";
import { recordAuditLog } from "./auditRepo";
import type { Actor } from "@/lib/auth/rbac";

export interface ReviewRow {
  id: string;
  productId: string;
  productName: string;
  userMobile: string | null;
  rating: number;
  comment: string | null;
  isApproved: boolean;
  createdAt: string;
}

export async function listReviews(status: "pending" | "approved" | "all" = "pending"): Promise<ReviewRow[]> {
  const statusClause = status === "pending" ? "r.is_approved = 0" : status === "approved" ? "r.is_approved = 1" : "1=1";
  const rows = await db
    .prepare(
      `SELECT r.id, r.product_id, p.name as product_name, u.mobile as user_mobile, r.rating, r.comment, r.is_approved, r.created_at
       FROM reviews r
       LEFT JOIN products p ON p.id = r.product_id
       LEFT JOIN users u ON u.id = r.user_id
       WHERE r.deleted_at IS NULL AND ${statusClause}
       ORDER BY r.created_at DESC`,
    )
    .all() as {
    id: string;
    product_id: string;
    product_name: string | null;
    user_mobile: string | null;
    rating: number;
    comment: string | null;
    is_approved: number;
    created_at: string;
  }[];

  return rows.map((r) => ({
    id: r.id,
    productId: r.product_id,
    productName: r.product_name ?? r.product_id,
    userMobile: r.user_mobile,
    rating: r.rating,
    comment: r.comment,
    isApproved: !!r.is_approved,
    createdAt: r.created_at,
  }));
}

export async function setReviewStatus(id: string, approve: boolean, actor: Actor): Promise<void> {
  await db.prepare("UPDATE reviews SET is_approved = ? WHERE id = ?").run(approve ? 1 : 0, id);
  await recordAuditLog(actor, approve ? "review.approve" : "review.reject", "review", id, null, { isApproved: approve });
}

/** حذف منطقی نظر — طبق الزام صریح Prompt 11 بخش ۱۳ (هرگز DELETE فیزیکی نیست) */
export async function softDeleteReview(id: string, actor: Actor): Promise<void> {
  await db.prepare("UPDATE reviews SET deleted_at = ? WHERE id = ?").run(new Date().toISOString(), id);
  await recordAuditLog(actor, "review.delete", "review", id, null, null);
}

// ===== خواندن عمومی (فروشگاه) — فقط نظرات تأییدشده =====
// طبق الزام صریح Prompt 12 («اطلاعات Schema باید دقیقاً با اطلاعات واقعی
// صفحه هماهنگ باشد؛ اطلاعات جعلی تولید نکن»): این دو تابع فقط چیزی را
// برمی‌گردانند که واقعاً در جدول `reviews` (تأییدشده توسط ادمین، طبق
// گردش‌کار Prompt 11) ثبت شده. اگر برای یک محصول هیچ نظر تأییدشده‌ای
// نباشد، `count` صفر است و صفحه محصول عمداً هیچ AggregateRating/Review
// در Structured Data خودش قرار نمی‌دهد.

export interface PublicReviewStats {
  count: number;
  average: number | null;
}

export async function getApprovedReviewStats(productId: string): Promise<PublicReviewStats> {
  const row = await db
    .prepare("SELECT COUNT(*) as cnt, AVG(rating) as avg FROM reviews WHERE product_id = ? AND is_approved = 1 AND deleted_at IS NULL")
    .get(productId) as { cnt: number; avg: number | null };
  return { count: row.cnt, average: row.avg };
}

export interface PublicReview {
  rating: number;
  comment: string | null;
  createdAt: string;
}

export async function getApprovedReviews(productId: string, limit = 10): Promise<PublicReview[]> {
  const rows = await db
    .prepare(
      "SELECT rating, comment, created_at FROM reviews WHERE product_id = ? AND is_approved = 1 AND deleted_at IS NULL ORDER BY created_at DESC LIMIT ?",
    )
    .all(productId, limit) as { rating: number; comment: string | null; created_at: string }[];
  return rows.map((r) => ({ rating: r.rating, comment: r.comment, createdAt: r.created_at }));
}
