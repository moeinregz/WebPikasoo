import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

/**
 * Hash رمز عبور با `scrypt` توکار Node.js (بدون وابستگی خارجی مثل bcrypt —
 * که در این Sandbox نصبش نیاز به کامپایل Native دارد و ریسک غیرضروری است).
 * فرمت ذخیره: `salt:hash` (هر دو Hex) — الگوی رایج و استاندارد.
 */

const KEY_LENGTH = 64;

export function hashPassword(plainPassword: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(plainPassword, salt, KEY_LENGTH).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(plainPassword: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(plainPassword, salt, KEY_LENGTH);
  const expected = Buffer.from(hash, "hex");
  if (candidate.length !== expected.length) return false;
  return timingSafeEqual(candidate, expected);
}
