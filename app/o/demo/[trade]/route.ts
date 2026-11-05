// Live demo for the SMS landing page: the trade's cinematic template rendered
// with the visitor's business name (?b=), shown inside a device frame there.
import { TEMPLATES } from "@/lib/siteTemplates";
import { renderSite } from "@/lib/siteTemplates/generate";
import { getTrade } from "@/lib/siteTemplates/trades";

export const dynamic = "force-dynamic";

// Contact buttons inside the demo reach us, not a made-up number.
const OUR_PHONE = "09965745535";

export async function GET(req: Request, { params }: { params: { trade: string } }) {
  const trade = getTrade(params.trade) ?? getTrade("shop");
  if (!trade) return new Response("not found", { status: 404 });
  const tpl = TEMPLATES.find((t) => t.id === `${trade.id}-lux`) ?? TEMPLATES.find((t) => t.trade === trade.id);
  if (!tpl) return new Response("not found", { status: 404 });

  const raw = new URL(req.url).searchParams.get("b") ?? "";
  const brand = raw.replace(/[<>{}"`]/g, "").replace(/\s+/g, " ").trim().slice(0, 40) || `${trade.label} شما`;
  const { html } = renderSite(tpl, trade, {
    brand,
    address: "آدرس کسب‌وکار شما",
    phones: [OUR_PHONE],
    whatsapp: OUR_PHONE,
    hours: "هر روز ۹ تا ۲۲",
  });
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "X-Robots-Tag": "noindex, nofollow",
      "Cache-Control": "public, max-age=300",
    },
  });
}
