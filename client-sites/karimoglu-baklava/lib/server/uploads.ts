import { randomUUID } from "crypto";
import { db } from "@/lib/db/client";

/**
 * عکس‌های آپلودشده از پنل ادمین داخل خود PostgreSQL (جدول `uploaded_images`، ستون BYTEA)
 * ذخیره می‌شوند؛ پس برنامه کاملاً Stateless است: نه دیسک لازم است، نه Volume، و
 * عکس‌ها همراه بقیه داده‌ها Backup می‌شوند. آدرس عمومی هر عکس `/uploads/<id>.<ext>` است
 * (سرو شده توسط `app/uploads/[filename]/route.ts` با Cache طولانی).
 */

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // ۵ مگابایت

type ImageKind = { ext: "jpg" | "png" | "webp" | "gif"; mime: string };

/** نوع واقعی فایل از روی بایت‌های ابتدایی (نه از روی نام/Content-Type که جعل‌شدنی‌اند) */
export function detectImageKind(buf: Buffer): ImageKind | null {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { ext: "jpg", mime: "image/jpeg" };
  if (buf.length >= 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])))
    return { ext: "png", mime: "image/png" };
  if (buf.length >= 12 && buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP")
    return { ext: "webp", mime: "image/webp" };
  if (buf.length >= 6 && ["GIF87a", "GIF89a"].includes(buf.subarray(0, 6).toString("ascii"))) return { ext: "gif", mime: "image/gif" };
  return null;
}

export async function saveUploadedImage(buf: Buffer): Promise<{ url: string } | { error: string }> {
  if (buf.length === 0) return { error: "فایل خالی است." };
  if (buf.length > MAX_UPLOAD_BYTES) return { error: "حجم عکس نباید بیشتر از ۵ مگابایت باشد." };
  const kind = detectImageKind(buf);
  if (!kind) return { error: "فقط عکس با فرمت JPG، PNG، WebP یا GIF مجاز است." };

  const id = randomUUID();
  await db
    .prepare("INSERT INTO uploaded_images (id, mime, size, data, created_at) VALUES (?, ?, ?, ?, ?)")
    .run(id, kind.mime, buf.length, buf, new Date().toISOString());
  return { url: `/uploads/${id}.${kind.ext}` };
}

const SAFE_FILENAME = /^([0-9a-f-]{36})\.(jpg|png|webp|gif)$/;

export async function readUploadedImage(filename: string): Promise<{ data: Buffer; mime: string } | null> {
  const match = SAFE_FILENAME.exec(filename);
  if (!match) return null;
  try {
    const row = (await db.prepare("SELECT mime, data FROM uploaded_images WHERE id = ?").get(match[1])) as
      | { mime: string; data: Buffer }
      | undefined;
    return row ? { data: row.data, mime: row.mime } : null;
  } catch {
    return null;
  }
}
