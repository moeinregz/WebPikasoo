import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "shahkar_admin";

function tokenFor(password: string) {
  return createHash("sha256").update(`shahkar:${password}`).digest("hex");
}

export function adminConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD);
}

export function checkPassword(input: string) {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return false;
  const a = Buffer.from(tokenFor(input));
  const b = Buffer.from(tokenFor(pw));
  return timingSafeEqual(a, b);
}

export function sessionToken() {
  return tokenFor(process.env.ADMIN_PASSWORD ?? "");
}

export async function isAdmin() {
  if (!adminConfigured()) return false;
  const value = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!value) return false;
  const a = Buffer.from(value);
  const b = Buffer.from(sessionToken());
  return a.length === b.length && timingSafeEqual(a, b);
}
