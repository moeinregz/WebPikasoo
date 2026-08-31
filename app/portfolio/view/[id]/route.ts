import { NextRequest, NextResponse } from "next/server";
import { getProjectById } from "@/lib/db";

// Lets an uploaded-HTML project ("نمونه‌کار") open on our own domain
// (webpikaso.../portfolio/view/123) instead of sending the visitor off to
// the Vercel Blob storage host directly. We fetch the stored file
// server-side and stream its bytes back with our own response headers.
// Projects that were given an external link instead just redirect there.
export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!id) {
    return new NextResponse("نمونه‌کار پیدا نشد.", { status: 404 });
  }

  const project = await getProjectById(id);
  if (!project) {
    return new NextResponse("نمونه‌کار پیدا نشد.", { status: 404 });
  }

  if (project.linkType !== "html") {
    return NextResponse.redirect(project.url);
  }

  try {
    const blobRes = await fetch(project.url, { cache: "no-store" });
    if (!blobRes.ok) {
      return new NextResponse("فایل نمونه‌کار در دسترس نیست.", { status: 502 });
    }
    const html = await blobRes.text();
    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        // The uploaded page is someone else's markup running under our
        // domain — an iframe-able sandbox-less response is fine since it's
        // admin-curated content, but we still keep it out of search indexing.
        "X-Robots-Tag": "noindex",
      },
    });
  } catch (err) {
    console.error("portfolio/view HTML fetch failed:", err);
    return new NextResponse("خطا در بارگذاری فایل نمونه‌کار.", { status: 502 });
  }
}
