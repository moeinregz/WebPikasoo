import { db } from "@/lib/db/client";
import type { Role } from "@/lib/auth/rbac";

export interface AdminUserRow {
  id: string;
  mobile: string;
  name: string | null;
  createdAt: string;
  role: Exclude<Role, "system"> | null;
  branchId: string | null;
}

export async function listUsers(search?: string): Promise<AdminUserRow[]> {
  const clauses: string[] = [];
  const params: unknown[] = [];
  if (search) {
    clauses.push("(u.mobile ILIKE ? OR u.name ILIKE ?)");
    params.push(`%${search}%`, `%${search}%`);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";

  const rows = await db
    .prepare(
      `SELECT u.id, u.mobile, u.name, u.created_at, ur.role_id, ur.branch_id
       FROM users u LEFT JOIN user_roles ur ON ur.user_id = u.id
       ${where}
       ORDER BY u.created_at DESC`,
    )
    .all(...params) as { id: string; mobile: string; name: string | null; created_at: string; role_id: Exclude<Role, "system"> | null; branch_id: string | null }[];

  return rows.map((r) => ({
    id: r.id,
    mobile: r.mobile,
    name: r.name,
    createdAt: r.created_at,
    role: r.role_id,
    branchId: r.branch_id,
  }));
}

export async function countOrdersForUser(userId: string): Promise<number> {
  return (await db.prepare("SELECT COUNT(*) as c FROM orders WHERE user_id = ?").get(userId) as { c: number }).c;
}

export async function removeRole(userId: string): Promise<void> {
  await db.prepare("DELETE FROM user_roles WHERE user_id = ?").run(userId);
}
