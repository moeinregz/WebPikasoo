// Server-only: renders a template with a business's details, stores the HTML
// and registers it as a private site (the same thing the dashboard's
// "ساخت سایت از قالب" tab and the CRM auto-build both need).
import { createPrivateSite, type PrivateSite } from "@/lib/db";
import { savePrivateSiteHtmlFile } from "@/lib/uploads";
import { renderSite, type SiteInput, type SiteTemplate } from "./generate";
import { getTrade, type Trade } from "./trades";

export async function buildPrivateSite(args: {
  template: SiteTemplate;
  input: SiteInput;
  note?: string;
}): Promise<{ site: PrivateSite; trade: Trade; template: SiteTemplate }> {
  const { template, input } = args;
  const trade = getTrade(template.trade);
  if (!trade) throw new Error(`unknown trade ${template.trade}`);

  const { html, unknown } = renderSite(template, trade, input);
  if (unknown.length) console.warn(`buildPrivateSite: unknown placeholders in ${template.id}:`, unknown);

  const url = await savePrivateSiteHtmlFile(new File([html], "site.html", { type: "text/html" }));
  if (!url) throw new Error("ذخیره‌ی فایل ناموفق بود");

  const site = await createPrivateSite({
    name: `${input.brand.trim()} (${trade.label})`,
    note: args.note ?? `از قالب «${template.label}» ساخته شد`,
    url,
    template_id: template.id,
  });
  return { site, trade, template };
}
