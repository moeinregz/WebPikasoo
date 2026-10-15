import { del, put } from "@vercel/blob";
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

/** Turns whatever @vercel/blob's put() threw into a message that says what
 *  actually went wrong, instead of always blaming a missing token — a
 *  wrong/expired token, a store that got disconnected, a network hiccup,
 *  and a genuinely-missing token all look identical from the outside
 *  otherwise, and guessing wrong wastes everyone's time debugging it. */
function blobErrorMessage(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  const looksLikeMissingToken = /no token found|missing.*token|BLOB_READ_WRITE_TOKEN/i.test(raw);
  if (looksLikeMissingToken) {
    return "آپلود ناموفق بود — متغیر محیطی BLOB_READ_WRITE_TOKEN تنظیم نشده (به README.md نگاه کن).";
  }
  return `آپلود ناموفق بود: ${raw}`;
}

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
    throw new Error(blobErrorMessage(err));
  }
}

const MAX_PROJECT_IMAGE_BYTES = 10 * 1024 * 1024; // 10MB
const MAX_PROJECT_HTML_BYTES = 15 * 1024 * 1024; // 15MB

/** Saves a portfolio project's cover image to Vercel Blob and returns its
 *  public URL. Returns null when no file was actually picked. Webp is the
 *  recommended format (matches the rest of the site's image assets) but
 *  any image type is accepted — we just store whatever was uploaded as-is,
 *  we don't transcode. */
export async function saveProjectImage(file: File): Promise<string | null> {
  if (!file || file.size === 0) return null;
  if (!file.type.startsWith("image/")) {
    throw new Error("فقط فایل تصویری قابل قبوله (ترجیحاً WebP).");
  }
  if (file.size > MAX_PROJECT_IMAGE_BYTES) {
    throw new Error("حجم عکس بیشتر از حد مجازه (حداکثر ۱۰ مگابایت).");
  }

  const filename = randomFilename(file.name, file.type, ".webp");

  try {
    const blob = await put(`projects/${filename}`, file, {
      access: "public",
      addRandomSuffix: false,
      contentType: file.type,
    });
    return blob.url;
  } catch (err) {
    console.error("saveProjectImage (Vercel Blob) failed:", err);
    throw new Error(blobErrorMessage(err));
  }
}

/** Saves an uploaded HTML file for a portfolio project (the "view it right
 *  on our own site" option) to Vercel Blob and returns its public URL.
 *  Content-type is forced to text/html regardless of what the browser
 *  reported, so /portfolio/view/[id] can fetch it and serve it inline on
 *  our own domain instead of the visitor bouncing to Blob's storage host. */
export async function saveProjectHtmlFile(file: File): Promise<string | null> {
  if (!file || file.size === 0) return null;

  const looksHtml =
    /\.html?$/i.test(file.name || "") || file.type === "text/html" || file.type === "application/xhtml+xml";
  if (!looksHtml) {
    throw new Error("فقط فایل HTML قابل قبوله (پسوند .html یا .htm).");
  }
  if (file.size > MAX_PROJECT_HTML_BYTES) {
    throw new Error("حجم فایل بیشتر از حد مجازه (حداکثر ۱۵ مگابایت).");
  }

  const filename = randomFilename(file.name, "text/html", ".html");

  try {
    const blob = await put(`projects-html/${filename}`, file, {
      access: "public",
      addRandomSuffix: false,
      contentType: "text/html; charset=utf-8",
    });
    return blob.url;
  } catch (err) {
    console.error("saveProjectHtmlFile (Vercel Blob) failed:", err);
    throw new Error(blobErrorMessage(err));
  }
}

/** Saves an HTML file for an admin-only private preview (see
 *  createPrivateSite in lib/db.ts) to Vercel Blob and returns its URL.
 *  Same rules as saveProjectHtmlFile, just stored under its own prefix so
 *  it's never mixed up with public portfolio files. */
export async function savePrivateSiteHtmlFile(file: File): Promise<string | null> {
  if (!file || file.size === 0) return null;

  const looksHtml =
    /\.html?$/i.test(file.name || "") || file.type === "text/html" || file.type === "application/xhtml+xml";
  if (!looksHtml) {
    throw new Error("فقط فایل HTML قابل قبوله (پسوند .html یا .htm).");
  }
  if (file.size > MAX_PROJECT_HTML_BYTES) {
    throw new Error("حجم فایل بیشتر از حد مجازه (حداکثر ۱۵ مگابایت).");
  }

  const filename = randomFilename(file.name, "text/html", ".html");

  try {
    const blob = await put(`private-sites/${filename}`, file, {
      access: "public",
      addRandomSuffix: false,
      contentType: "text/html; charset=utf-8",
    });
    return blob.url;
  } catch (err) {
    console.error("savePrivateSiteHtmlFile (Vercel Blob) failed:", err);
    throw new Error(blobErrorMessage(err));
  }
}

const MAX_SITE_IMAGE_BYTES = 4 * 1024 * 1024; // Vercel caps a request body at ~4.5MB

/** Saves a photo for one image slot of a private site (see ImageSlot in
 *  lib/siteTemplates/generate.ts) to Vercel Blob and returns its URL. The
 *  dashboard shrinks photos in the browser first, so this is just the
 *  server-side safety net: real JPEG/PNG/WebP content only, 4MB at most. */
export async function savePrivateSiteImage(file: File): Promise<string> {
  if (!file || file.size === 0) throw new Error("عکسی انتخاب نشده.");
  if (file.size > MAX_SITE_IMAGE_BYTES) throw new Error("حجم عکس بعد از فشرده‌سازی هم بیشتر از ۴ مگابایته؛ یه عکس کم‌حجم‌تر انتخاب کن.");

  const head = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const isJpeg = head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff;
  const isPng = head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47;
  const isWebp =
    head[0] === 0x52 && head[1] === 0x49 && head[2] === 0x46 && head[3] === 0x46 &&
    head[8] === 0x57 && head[9] === 0x45 && head[10] === 0x42 && head[11] === 0x50;
  if (!isJpeg && !isPng && !isWebp) throw new Error("فقط عکس JPG، PNG یا WebP قابل قبوله.");
  const type = isJpeg ? "image/jpeg" : isPng ? "image/png" : "image/webp";
  const ext = isJpeg ? ".jpg" : isPng ? ".png" : ".webp";

  const filename = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
  try {
    const blob = await put(`private-sites/img/${filename}`, file, {
      access: "public",
      addRandomSuffix: false,
      contentType: type,
    });
    return blob.url;
  } catch (err) {
    console.error("savePrivateSiteImage (Vercel Blob) failed:", err);
    throw new Error(blobErrorMessage(err));
  }
}

/** Best-effort removal of a Blob file we no longer reference. Never throws. */
export async function deleteBlobQuietly(url: string): Promise<void> {
  try {
    await del(url);
  } catch (err) {
    console.error("deleteBlobQuietly failed:", err);
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
    throw new Error(blobErrorMessage(err));
  }
}
