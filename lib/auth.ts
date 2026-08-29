import crypto from "crypto";

// A dev fallback keeps `next dev` working with zero setup, but every
// deployed environment must set a real secret — otherwise sessions signed
// on one restart won't validate after the next (the fallback is random
// per-process), and worse, everyone would share a guessable secret.
const SESSION_SECRET = process.env.USER_SESSION_SECRET || "dev-only-insecure-secret-set-USER_SESSION_SECRET";

const SCRYPT_KEYLEN = 64;

export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, SCRYPT_KEYLEN).toString("hex");
  return { hash, salt };
}

export function verifyPassword(password: string, salt: string, expectedHash: string): boolean {
  const hash = crypto.scryptSync(password, salt, SCRYPT_KEYLEN);
  const expected = Buffer.from(expectedHash, "hex");
  if (hash.length !== expected.length) return false;
  return crypto.timingSafeEqual(hash, expected);
}

/** Signs a user id into an opaque cookie value: "<id>.<hmac>". */
export function createSessionToken(userId: number): string {
  const payload = String(userId);
  const sig = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

/** Verifies the token's signature and returns the user id, or null. */
export function verifySessionToken(token: string | undefined): number | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
  const sigBuf = Buffer.from(sig, "hex");
  const expectedBuf = Buffer.from(expected, "hex");
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }
  const id = Number(payload);
  return Number.isInteger(id) ? id : null;
}

// Accepts common Iranian mobile formats: 09xxxxxxxxx, +989xxxxxxxxx, 00989xxxxxxxxx.
const PHONE_PATTERN = /^(?:0|0098|\+98)9\d{9}$/;

const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

/** Converts Persian (۰-۹) and Arabic-Indic (٠-٩) digits — what a Persian
 *  keyboard types by default — to plain ASCII digits. Anything else passes
 *  through untouched. Used before validating/storing phone numbers so a
 *  user typing ۰۹۱۲۳۴۵۶۷۸۹ works exactly like 09123456789. */
export function toEnglishDigits(input: string): string {
  return input.replace(/[۰-۹٠-٩]/g, (ch) => {
    const p = PERSIAN_DIGITS.indexOf(ch);
    if (p !== -1) return String(p);
    const a = ARABIC_DIGITS.indexOf(ch);
    return a !== -1 ? String(a) : ch;
  });
}

/** Converts ASCII digits to Persian digits — for *displaying* numbers
 *  (phone numbers, counters) in the Persian-formatted style the rest of
 *  the UI uses. Never use this on a value before storing/validating it. */
export function toPersianDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => PERSIAN_DIGITS[Number(d)]);
}

export function isValidPhone(phone: string): boolean {
  return PHONE_PATTERN.test(toEnglishDigits(phone).trim());
}

/** Normalizes any accepted format (English or Persian digits) to local
 *  09xxxxxxxxx for consistent storage/lookup. */
export function normalizePhone(phone: string): string {
  const trimmed = toEnglishDigits(phone).trim();
  if (trimmed.startsWith("+98")) return "0" + trimmed.slice(3);
  if (trimmed.startsWith("0098")) return "0" + trimmed.slice(4);
  return trimmed;
}
