import { db } from "@/lib/db/client";

export interface NotificationRow {
  id: string;
  userMobile: string | null;
  type: string;
  payload: string | null;
  isRead: boolean;
  createdAt: string;
}

export async function listNotifications(limit = 100): Promise<NotificationRow[]> {
  const rows = await db
    .prepare(
      `SELECT n.id, u.mobile as user_mobile, n.type, n.payload, n.is_read, n.created_at
       FROM notifications n LEFT JOIN users u ON u.id = n.user_id
       ORDER BY n.created_at DESC LIMIT ?`,
    )
    .all(limit) as { id: string; user_mobile: string | null; type: string; payload: string | null; is_read: number; created_at: string }[];
  return rows.map((r) => ({ id: r.id, userMobile: r.user_mobile, type: r.type, payload: r.payload, isRead: !!r.is_read, createdAt: r.created_at }));
}

export interface SmsLogRow {
  id: string;
  toMobile: string;
  template: string;
  status: string;
  providerRef: string | null;
  createdAt: string;
}

export async function listSmsLogs(limit = 100): Promise<SmsLogRow[]> {
  const rows = await db.prepare("SELECT * FROM sms_logs ORDER BY created_at DESC LIMIT ?").all(limit) as {
    id: string;
    to_mobile: string;
    template: string;
    status: string;
    provider_ref: string | null;
    created_at: string;
  }[];
  return rows.map((r) => ({ id: r.id, toMobile: r.to_mobile, template: r.template, status: r.status, providerRef: r.provider_ref, createdAt: r.created_at }));
}
