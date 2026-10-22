import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { getPrivateSiteById } from "@/lib/db";
import { injectSiteImages } from "@/lib/siteTemplates/generate";

// Downloads a private site (built from the CRM, the template builder, or
// uploaded by hand) as ONE standalone .html file — admins only, same as the
// «سایت‌های خصوصی» tab itself.
//
// Photos uploaded for the site live on Vercel Blob and are normally swapped in
// when /preview/<token> is served. For the download they are embedded straight
// into the file (as data: URIs) so the .html works wherever it is dropped —
// on a customer's hosting, from an email attachment, offline. Only Google
// Fonts and the animation libraries (GSAP/Lenis) are still loaded from their
// CDNs, as in the live preview.
export const dynamic = "force-dynamic";

const MAX_IMAGE_BYTES = 6 * 1024 * 1024;
const MAX_TOTAL_BYTES = 40 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

/** Fetches every uploaded photo and returns it as a data: URI. A photo that
 *  can't be fetched (or is too big) keeps its normal https URL, so the file
 *  still works online. */
async function embedImages(images: Record<string, string>): Promise<Record<string, string>> {
  const out: Record<string, string> = { ...images };
  let total = 0;
  for (const [key, url] of Object.entries(images)) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) continue;
      const type = (res.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
      if (!ALLOWED_TYPES.has(type)) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length > MAX_IMAGE_BYTES || total + buf.length > MAX_TOTAL_BYTES) continue;
      total += buf.length;
      out[key] = `data:${type};base64,${buf.toString("base64")}`;
    } catch (err) {
      console.error("download: could not embed image", key, err);
    }
  }
  return out;
}

/** A readable, filesystem-safe name: keeps Persian letters, drops the rest. */
function fileBase(name: string, id: number): string {
  const cleaned = name
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, " ")
    .replace(/\s+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return cleaned || `site-${id}`;
}

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user || !user.isAdmin) {
    return new NextResponse("اجازه‌ی دسترسی نداری.", { status: 403 });
  }

  const id = Number(params.id);
  const site = Number.isInteger(id) && id > 0 ? await getPrivateSiteById(id) : null;
  if (!site) return new NextResponse("سایت پیدا نشد.", { status: 404 });

  try {
    const blobRes = await fetch(site.url, { cache: "no-store" });
    if (!blobRes.ok) return new NextResponse("فایل سایت در دسترس نیست.", { status: 502 });
    let html = await blobRes.text();
    if (site.images && Object.keys(site.images).length > 0) {
      html = injectSiteImages(html, await embedImages(site.images), { allowData: true });
    }

    const base = fileBase(site.name, site.id);
    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        // ASCII fallback + the real (possibly Persian) name for modern browsers.
        "Content-Disposition": `attachment; filename="site-${site.id}.html"; filename*=UTF-8''${encodeURIComponent(base)}.html`,
        "Cache-Control": "private, no-store",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  } catch (err) {
    console.error("private site download failed:", err);
    return new NextResponse("خطا در آماده‌سازی فایل.", { status: 502 });
  }
}
