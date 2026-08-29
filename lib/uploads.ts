import { put } from "@vercel/blob";
import crypto from "crypto";

// Files (blog cover images, team-chat attachments/voice notes) are stored
// in Vercel Blob — object storage, not the local filesystem — because
// Vercel's filesystem is ephemeral per-invocation: anything written to
// public/uploads/* on one request can be gone by the next one, and is
// always gone after a redeploy. Vercel Blob works the same way locally
// (`next dev`) and in production/preview deployments.
//
// Requires the BLOB_READ_WRITE_TOKEN environment variable:
//   - On Vercel: Project → Storage → Create Database → Blob, then
//     connect it to this project. Vercel sets BLOB_READ_WRITE_TOKEN for
//     you automatically once it's connected — nothing to copy by hand.
//   - Locally: run `vercel env pull .env.local` (once the project is
//     linked with `vercel link`) to pull that same token down, or copy
//     it manually from Project → Storage → your Blob store → ".env.local".
//
// See the "آپلود فایل (Vercel Blob)" section in README.md for full setup.

const MAX_ATTACHMENT_BYTES = 15 * 1024 * 1024; // 15MB
const MAX_BLOG_IMAGE_BYTES = 10 * 1024 * 1024; // 10MB

function safeExtension(filename: string, mimeType: string): string {
  const fromName = (filename || "").match(/\.[a-zA-Z0-9]{1,10}$/)?.[0] ?? "";
  if (fromName) return fromName;
  if (mimeType.startsWith("audio/webm")) return ".webm";
  if (mimeType.startsWith("audio/")) return ".audio";
  if (mimeType.startsWith("image/")) return "." + mimeType.split("/")[1];
  return "";
}

function randomFilename(originalName: string, mimeType: string, fallbackExt = ""): string {
  const ext = safeExtension(originalName, mimeType) || fallbackExt;
  return `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
}

/** Saves a blog post's cover image to Vercel Blob and returns its public
 *  URL. Returns null when no file was actually picked (an empty file
 *  input still arrives as a zero-byte File, not undefined). Images only. */
export async function saveBlogImage(file: File): Promise<string | null> {
  if (!file || file.size === 0) return null;
  if (!file.type.startsWith("image/")) {
    throw new Error("فقط فایل تصویری قابل قبوله.");
  }
  if (file.size > MAX_BLOG_IMAGE_BYTES) {
    throw new Error("حجم عکس بیشتر از حد مجازه (حداکثر ۱۰ مگابایت).");
  }

  const filename = randomFilename(file.name, file.type, ".jpg");

  try {
    const blob = await put(`blog/${filename}`, file, {
      access: "public",
      addRandomSuffix: false,
      contentType: file.type,
    });
    return blob.url;
  } catch (err) {
    console.error("saveBlogImage (Vercel Blob) failed:", err);
    throw new Error(
      "آپلود عکس ناموفق بود — مطمئن شو متغیر محیطی BLOB_READ_WRITE_TOKEN تنظیم شده (به README.md نگاه کن)."
    );
  }
}

export type SavedAttachment = { url: string; type: string; name: string };

/** Saves a chat attachment (file upload or recorded voice note) to
 *  Vercel Blob and returns the public URL + metadata to store alongside
 *  the message. Returns null if the file is empty/missing. */
export async function saveChatAttachment(file: File): Promise<SavedAttachment | null> {
  if (!file || file.size === 0) return null;
  if (file.size > MAX_ATTACHMENT_BYTES) {
    throw new Error("حجم فایل بیشتر از حد مجازه (حداکثر ۱۵ مگابایت).");
  }

  const filename = randomFilename(file.name, file.type);

  try {
    const blob = await put(`chat/${filename}`, file, {
      access: "public",
      addRandomSuffix: false,
      contentType: file.type || "application/octet-stream",
    });
    return {
      url: blob.url,
      type: file.type || "application/octet-stream",
      name: file.name || filename,
    };
  } catch (err) {
    console.error("saveChatAttachment (Vercel Blob) failed:", err);
    throw new Error(
      "آپلود فایل ناموفق بود — مطمئن شو متغیر محیطی BLOB_READ_WRITE_TOKEN تنظیم شده (به README.md نگاه کن)."
    );
  }
}
