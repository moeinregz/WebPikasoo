import { NextRequest, NextResponse } from "next/server";
import { getPrivateSiteByToken } from "@/lib/db";
import { qrMenuPageHtml } from "@/lib/siteTemplates/qrMenuPage";
import { apiOrigin, brandOfSite, menuOfSite, siteColor } from "@/lib/siteTemplates/siteAddon";

// The page a table's QR code opens: webpikaso.ir/m/<token>. Only for sites with
// the «منوی QR» feature on; it always shows the CURRENT menu (edits made in the
// dashboard or the owner's panel show up within seconds).
export const dynamic = "force-dynamic";

const NOT_FOUND = () =>
  new NextResponse("منو پیدا نشد.", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });

export async function GET(request: NextRequest, { params }: { params: { token: string } }) {
  const token = params.token;
  if (!token || !/^[A-Za-z0-9_-]{8,64}$/.test(token)) return NOT_FOUND();

  const site = await getPrivateSiteByToken(token);
  if (!site || !site.features?.includes("qrmenu")) return NOT_FOUND();

  const menu = menuOfSite(site);
  if (menu.length === 0) return NOT_FOUND();

  const origin = apiOrigin(request.nextUrl.origin);
  const html = qrMenuPageHtml({
    brand: brandOfSite(site),
    color: siteColor(site),
    menu,
    phone: site.meta?.phone,
    address: site.meta?.address,
    orderHref: site.features.includes("order") ? `${origin}/preview/${site.token}#sa-order` : undefined,
  });
  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "X-Robots-Tag": "noindex, nofollow",
      "Cache-Control": "public, max-age=0, s-maxage=20, stale-while-revalidate=60",
    },
  });
}
