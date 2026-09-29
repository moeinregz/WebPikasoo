import { NextRequest, NextResponse } from "next/server";
import { getPrivateSiteByToken } from "@/lib/db";

// Serves an admin-uploaded private preview (see the «سایت‌های خصوصی» tab in
// /dashboard) on our own domain: webpikaso.ir/preview/<token>. Anyone with
// the link can view it, but it's never listed anywhere — not in the
// portfolio, not in the sitemap — and search engines are told to skip it.
export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest, { params }: { params: { token: string } }) {
  const token = params.token;
  // Tokens are url-safe base64 (A–Z a–z 0–9 - _); reject anything else early.
  if (!token || !/^[A-Za-z0-9_-]{8,64}$/.test(token)) {
    return new NextResponse("پیدا نشد.", { status: 404 });
  }

  const site = await getPrivateSiteByToken(token);
  if (!site) {
    return new NextResponse("پیدا نشد.", { status: 404 });
  }

  try {
    const blobRes = await fetch(site.url, { cache: "no-store" });
    if (!blobRes.ok) {
      return new NextResponse("فایل در دسترس نیست.", { status: 502 });
    }
    const html = await blobRes.text();
    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "X-Robots-Tag": "noindex, nofollow, noarchive",
        "Cache-Control": "private, no-store",
        "Referrer-Policy": "no-referrer",
      },
    });
  } catch (err) {
    console.error("preview HTML fetch failed:", err);
    return new NextResponse("خطا در بارگذاری فایل.", { status: 502 });
  }
}
