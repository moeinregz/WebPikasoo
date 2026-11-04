import "server-only";
import { cookies } from "next/headers";
import { db, type Customer } from "./db";
import { randomToken } from "./hash";

const CUSTOMER_COOKIE = "mg_session";
const ADMIN_COOKIE = "mg_admin";
const DAY = 24 * 60 * 60 * 1000;

function createSession(kind: "customer" | "admin", userId: number, days: number) {
  const token = randomToken();
  const expires = Date.now() + days * DAY;
  db().prepare("INSERT INTO sessions (token, kind, user_id, expires_at) VALUES (?, ?, ?, ?)").run(token, kind, userId, expires);
  cookies().set(kind === "admin" ? ADMIN_COOKIE : CUSTOMER_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && (process.env.SITE_URL || "").startsWith("https"),
    path: "/",
    expires: new Date(expires),
  });
}

function readSession(kind: "customer" | "admin"): number | null {
  const token = cookies().get(kind === "admin" ? ADMIN_COOKIE : CUSTOMER_COOKIE)?.value;
  if (!token) return null;
  const row = db().prepare("SELECT user_id, expires_at FROM sessions WHERE token = ? AND kind = ?").get(token, kind) as
    | { user_id: number; expires_at: number }
    | undefined;
  if (!row || row.expires_at < Date.now()) return null;
  return row.user_id;
}

function destroySession(kind: "customer" | "admin") {
  const name = kind === "admin" ? ADMIN_COOKIE : CUSTOMER_COOKIE;
  const token = cookies().get(name)?.value;
  if (token) db().prepare("DELETE FROM sessions WHERE token = ?").run(token);
  cookies().delete(name);
}

export const loginCustomer = (id: number) => createSession("customer", id, 60);
export const logoutCustomer = () => destroySession("customer");
export const loginAdmin = (id: number) => createSession("admin", id, 7);
export const logoutAdmin = () => destroySession("admin");

export function currentCustomer(): Customer | null {
  const id = readSession("customer");
  if (!id) return null;
  return (db().prepare("SELECT * FROM customers WHERE id = ?").get(id) as Customer) || null;
}

export function currentAdminId(): number | null {
  return readSession("admin");
}
