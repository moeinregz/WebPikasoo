import { randomBytes, createHash } from "crypto";
import { db } from "@/lib/db/client";

export const SESSION_COOKIE_NAME = "komoglu_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // ۳۰ روز

/**
 * توکن خام Session هرگز در دیتابیس ذخیره نمی‌شود — فقط SHA-256 آن. اگر
 * دیتابیس لو برود، مهاجم نمی‌تواند از آن Hashها یک Session معتبر بسازد
 * (برخلاف ذخیره مستقیم توکن).
 */
export function hashSessionToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

export async function createSession(userId: string): Promise<{ rawToken: string; expiresAt: string }> {
  const rawToken = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();

  await db.prepare("INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)").run(
    hashSessionToken(rawToken),
    userId,
    new Date().toISOString(),
    expiresAt,
  );

  return { rawToken, expiresAt };
}

export async function destroySessionByRawToken(rawToken: string): Promise<void> {
  await db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(hashSessionToken(rawToken));
}

export function sessionCookieHeader(rawToken: string, expiresAt: string): string {
  const isProd = process.env.NODE_ENV === "production";
  const expires = new Date(expiresAt).toUTCString();
  return [
    `${SESSION_COOKIE_NAME}=${rawToken}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    isProd ? "Secure" : "",
    `Expires=${expires}`,
  ]
    .filter(Boolean)
    .join("; ");
}

export function clearSessionCookieHeader(): string {
  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}
