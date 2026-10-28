// Server-only. Login of the owner's management panel (/panel/<token>).
//
// Every site with the «پنل مدیریت» feature has its own password (stored only as
// a scrypt hash on the site). A correct password sets an httpOnly cookie that
// is an HMAC of (token + the password's salt) — so regenerating the password
// instantly logs everybody out. A logged-in webpikaso admin may open any panel
// without the password.
import crypto from "crypto";
import { cookies, headers } from "next/headers";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { getPrivateSiteByToken, type PrivateSite } from "@/lib/db";
import { allowAndCooldown } from "@/lib/redis";
import { getCurrentUser } from "@/lib/session";

const SECRET = process.env.USER_SESSION_SECRET || "dev-only-insecure-secret-set-USER_SESSION_SECRET";

// No 0/O/1/I/L so it can be read out over the phone.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

/** A new random password (shown once to the admin) + what gets stored. */
export function newPanelLogin(): { plain: string; panel: { salt: string; hash: string } } {
  const bytes = crypto.randomBytes(8);
  const chars = Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
  const plain = `${chars.slice(0, 4)}-${chars.slice(4)}`;
  const { hash, salt } = hashPassword(plain);
  return { plain, panel: { salt, hash } };
}

const cookieName = (token: string) => `sp_${token}`;

function sign(token: string, salt: string): string {
  return crypto.createHmac("sha256", SECRET).update(`panel:${token}:${salt}`).digest("hex");
}

export function clientKey(): string {
  try {
    const h = headers();
    return (h.get("x-forwarded-for") || h.get("x-real-ip") || "unknown").split(",")[0].trim();
  } catch {
    return "unknown";
  }
}

/** Checks the password (rate-limited per IP + site) and, if right, sets the session cookie. */
export async function panelLogin(token: string, password: string): Promise<{ ok: boolean; message: string }> {
  const site = await getPrivateSiteByToken(token);
  if (!site || !site.features?.includes("panel") || !site.panel) {
    return { ok: false, message: "این پنل فعال نیست." };
  }
  if (!(await allowAndCooldown(`panel-login:${clientKey()}:${token}`, 1500))) {
    return { ok: false, message: "کمی صبر کن و دوباره امتحان کن." };
  }
  const pw = password.trim().toUpperCase().replace(/\s+/g, "");
  const withDash = pw.length === 8 ? `${pw.slice(0, 4)}-${pw.slice(4)}` : pw;
  if (!verifyPassword(withDash, site.panel.salt, site.panel.hash)) {
    return { ok: false, message: "رمز درست نیست." };
  }
  cookies().set(cookieName(token), sign(token, site.panel.salt), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return { ok: true, message: "" };
}

export function panelLogout(token: string) {
  cookies().set(cookieName(token), "", { path: "/", maxAge: 0 });
}

/** True for the owner (valid cookie) or a logged-in webpikaso admin. */
export async function hasPanelAccess(site: PrivateSite): Promise<boolean> {
  if (!site.features?.includes("panel")) return false;
  const value = cookies().get(cookieName(site.token))?.value;
  if (value && site.panel) {
    const expected = sign(site.token, site.panel.salt);
    const a = Buffer.from(value);
    const b = Buffer.from(expected);
    if (a.length === b.length && crypto.timingSafeEqual(a, b)) return true;
  }
  const user = await getCurrentUser();
  return !!user && user.role === "admin";
}

/** The site, only when the caller may use its panel. */
export async function authedPanelSite(token: string): Promise<PrivateSite | null> {
  if (!/^[A-Za-z0-9_-]{8,64}$/.test(token)) return null;
  const site = await getPrivateSiteByToken(token);
  if (!site) return null;
  return (await hasPanelAccess(site)) ? site : null;
}
