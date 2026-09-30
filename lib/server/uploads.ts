import path from "path";
import { randomUUID } from "crypto";
import { mkdir, writeFile, readFile } from "fs/promises";

/**
 * ذخیره‌سازی عکس‌های آپلودشده از پنل ادمین.
 *
 * چرا داخل `public/` نیست: در حالت `output: "standalone"` فایل‌هایی که بعد از
 * Build به `public/` اضافه شوند سرو نمی‌شوند (و با هر Deploy جدید هم از بین
 * می‌روند). به‌جای آن، فایل‌ها کنار دیتابیس (که در Docker روی Volume پایدار
 * است) ذخیره می‌شوند و از مسیر `/uploads/<filename>` سرو می‌شوند.
 *
 * مسیر پیش‌فرض: پوشه `uploads` کنار فایل دیتابیس. با متغیر
 * `KARIMOGLU_UPLOAD_DIR` قابل تغییر است.
 */

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // ۵ مگابایت

function getUploadDir(): string {
  if (process.env.KARIMOGLU_UPLOAD_DIR) return path.resolve(process.env.KARIMOGLU_UPLOAD_DIR);
  const dbPath = process.env.KARIMOGLU_DB_PATH;
  if (dbPath && dbPath !== ":memory:") return path.join(path.dirname(path.resolve(dbPath)), "uploads");
  return path.resolve(process.cwd(), ".data", "uploads");
}

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

  const dir = getUploadDir();
  await mkdir(dir, { recursive: true });
  const filename = `${randomUUID()}.${kind.ext}`;
  await writeFile(path.join(dir, filename), buf);
  return { url: `/uploads/${filename}` };
}

const SAFE_FILENAME = /^[0-9a-f-]{36}\.(jpg|png|webp|gif)$/;

export async function readUploadedImage(filename: string): Promise<{ data: Buffer; mime: string } | null> {
  if (!SAFE_FILENAME.test(filename)) return null; // جلوگیری از Path Traversal
  try {
    const data = await readFile(path.join(getUploadDir(), filename));
    const kind = detectImageKind(data);
    return kind ? { data, mime: kind.mime } : null;
  } catch {
    return null;
  }
}
