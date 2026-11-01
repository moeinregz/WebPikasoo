import { randomUUID } from "crypto";
import { db } from "@/lib/db/client";
import type { Actor } from "@/lib/auth/rbac";

/**
 * ===== Audit Log عمومی (Prompt 11، بخش ۱۵) =====
 *
 * برای عملیات حساس پنل مدیریت که خودشان یک سیستم Audit اختصاصی ندارند
 * (محصول، نقش کاربر، تنظیمات، بررسی نظر). موجودی/سفارش سیستم Audit
 * اختصاصی و دقیق‌تر خودشان را دارند (`inventory_transactions` از Prompt 9،
 * `order_status_history` از Prompt 10) — این‌ها عمداً اینجا تکرار نمی‌شوند؛
 * صفحه Audit Log پنل هر سه منبع را کنار هم نشان می‌دهد.
 */

export async function recordAuditLog(
  actor: Actor,
  action: string,
  entityType: string,
  entityId: string | null,
  before: unknown,
  after: unknown,
): Promise<void> {
  await db.prepare(
    "INSERT INTO audit_logs (id, actor_id, actor_role, action, entity_type, entity_id, before_json, after_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
  ).run(
    randomUUID(),
    actor.id,
    actor.role,
    action,
    entityType,
    entityId,
    before === null || before === undefined ? null : JSON.stringify(before),
    after === null || after === undefined ? null : JSON.stringify(after),
    new Date().toISOString(),
  );
}

export interface AuditLogRow {
  id: string;
  actorId: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string | null;
  before: unknown;
  after: unknown;
  createdAt: string;
}

export interface AuditLogFilters {
  entityType?: string;
  actorId?: string;
  limit?: number;
}

export async function getAuditLogs(filters: AuditLogFilters = {}): Promise<AuditLogRow[]> {
  const clauses: string[] = [];
  const params: unknown[] = [];
  if (filters.entityType) {
    clauses.push("entity_type = ?");
    params.push(filters.entityType);
  }
  if (filters.actorId) {
    clauses.push("actor_id = ?");
    params.push(filters.actorId);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const limit = filters.limit ?? 100;

  const rows = await db
    .prepare(`SELECT * FROM audit_logs ${where} ORDER BY created_at DESC LIMIT ?`)
    .all(...params, limit) as {
    id: string;
    actor_id: string;
    actor_role: string;
    action: string;
    entity_type: string;
    entity_id: string | null;
    before_json: string | null;
    after_json: string | null;
    created_at: string;
  }[];

  return rows.map((r) => ({
    id: r.id,
    actorId: r.actor_id,
    actorRole: r.actor_role,
    action: r.action,
    entityType: r.entity_type,
    entityId: r.entity_id,
    before: r.before_json ? JSON.parse(r.before_json) : null,
    after: r.after_json ? JSON.parse(r.after_json) : null,
    createdAt: r.created_at,
  }));
}
