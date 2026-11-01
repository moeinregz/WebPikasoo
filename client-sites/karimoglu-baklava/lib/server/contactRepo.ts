import { randomUUID } from "crypto";
import { db } from "@/lib/db/client";
import { recordAuditLog } from "@/lib/server/auditRepo";
import type { Actor } from "@/lib/auth/rolesData";

export interface ContactMessageInput {
  name: string;
  mobile: string;
  message: string;
}

const MOBILE_REGEX = /^09\d{9}$/;

export interface ContactValidationError {
  field: "name" | "mobile" | "message";
  message: string;
}

/**
 * اعتبارسنجی سمت سرور — طبق الزام صریح Prompt («Frontend Validation
 * به‌تنهایی کافی نیست»)، این Validation مستقل از هر بررسی Frontend اجرا
 * می‌شود و تنها مرجع واقعی است.
 */
export function validateContactMessage(input: Partial<ContactMessageInput>): ContactValidationError[] {
  const errors: ContactValidationError[] = [];
  const name = input.name?.trim() ?? "";
  const mobile = input.mobile?.trim() ?? "";
  const message = input.message?.trim() ?? "";

  if (name.length < 2 || name.length > 100) {
    errors.push({ field: "name", message: "نام باید بین ۲ تا ۱۰۰ کاراکتر باشد." });
  }
  if (!MOBILE_REGEX.test(mobile)) {
    errors.push({ field: "mobile", message: "شماره موبایل معتبر نیست (مثال: 09xxxxxxxxx)." });
  }
  if (message.length < 10 || message.length > 2000) {
    errors.push({ field: "message", message: "پیام باید بین ۱۰ تا ۲۰۰۰ کاراکتر باشد." });
  }

  return errors;
}

export async function createContactMessage(input: ContactMessageInput): Promise<{ id: string }> {
  const id = randomUUID();
  await db.prepare(
    `INSERT INTO contact_messages (id, name, mobile, message, status, created_at) VALUES (?, ?, ?, ?, 'new', ?)`,
  ).run(id, input.name.trim(), input.mobile.trim(), input.message.trim(), new Date().toISOString());
  return { id };
}

// ===== خواندن/مدیریت در پنل ادمین (اضافه‌شده — درخواست مستقیم کاربر) =====

export interface ContactMessageRow {
  id: string;
  name: string;
  mobile: string;
  message: string;
  status: "new" | "read" | "resolved";
  createdAt: string;
}

export type ContactMessageStatusFilter = "new" | "read" | "resolved" | "all";

export async function listContactMessages(status: ContactMessageStatusFilter = "all"): Promise<ContactMessageRow[]> {
  const rows = (
    status === "all"
      ? await db.prepare("SELECT * FROM contact_messages ORDER BY created_at DESC").all()
      : await db.prepare("SELECT * FROM contact_messages WHERE status = ? ORDER BY created_at DESC").all(status)
  ) as { id: string; name: string; mobile: string; message: string; status: string; created_at: string }[];

  // نگاشت به Object Literal تازه — طبق همان اصلاح Root Cause که در
  // lib/server/productsRepo.ts (listCategories) انجام شد: ردیف خام
  // node:sqlite با Prototype خالی نباید مستقیم به یک Client Component برسد.
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    mobile: r.mobile,
    message: r.message,
    status: r.status as ContactMessageRow["status"],
    createdAt: r.created_at,
  }));
}

export async function countNewContactMessages(): Promise<number> {
  const row = await db.prepare("SELECT COUNT(*) as c FROM contact_messages WHERE status = 'new'").get() as { c: number };
  return row.c;
}

export async function setContactMessageStatus(id: string, status: "read" | "resolved", actor: Actor): Promise<void> {
  await db.prepare("UPDATE contact_messages SET status = ? WHERE id = ?").run(status, id);
  await recordAuditLog(actor, "contact.status_update", "contact_message", id, null, { status });
}
