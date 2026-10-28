// Server-only: renders a template with a business's details, stores the HTML
// and registers it as a private site (the same thing the dashboard's
// "ساخت سایت از قالب" tab and the CRM auto-build both need).
import { createPrivateSite, type PrivateSite } from "@/lib/db";
import { savePrivateSiteHtmlFile } from "@/lib/uploads";
import { renderSite, type SiteInput, type SiteTemplate } from "./generate";
import { getTrade, type Trade } from "./trades";
import { sanitizeFeatures, type FeatureId } from "./features";
import { newPanelLogin } from "@/lib/panelAuth";
import { toEn, whatsappNumber } from "./generate";

export async function buildPrivateSite(args: {
  template: SiteTemplate;
  input: SiteInput;
  note?: string;
  /** optional add-ons (سفارش آنلاین، رزرو، منوی QR، پنل...) — filtered to what the trade offers */
  features?: string[];
}): Promise<{ site: PrivateSite; trade: Trade; template: SiteTemplate; panelPassword?: string }> {
  const { template, input } = args;
  const trade = getTrade(template.trade);
  if (!trade) throw new Error(`unknown trade ${template.trade}`);

  const { html, unknown } = renderSite(template, trade, input);
  if (unknown.length) console.warn(`buildPrivateSite: unknown placeholders in ${template.id}:`, unknown);

  const url = await savePrivateSiteHtmlFile(new File([html], "site.html", { type: "text/html" }));
  if (!url) throw new Error("ذخیره‌ی فایل ناموفق بود");

  const features: FeatureId[] = sanitizeFeatures(trade.id, args.features ?? []);
  const login = features.includes("panel") ? newPanelLogin() : null;
  const waDigits = input.whatsapp ? whatsappNumber(input.whatsapp) : null;
  const chosen = input.primary ?? template.palette?.primary ?? trade.colors.primary;

  const site = await createPrivateSite({
    name: `${input.brand.trim()} (${trade.label})`,
    note: args.note ?? `از قالب «${template.label}» ساخته شد`,
    url,
    template_id: template.id,
    // what the add-on needs later (it is injected when the page is served)
    meta: {
      brand: input.brand.trim(),
      phone: input.phones[0] ? toEn(input.phones[0]).trim() : undefined,
      whatsapp: waDigits || undefined,
      color: /^#[0-9a-fA-F]{6}$/.test(chosen) ? chosen : undefined,
      address: input.address.trim() || undefined,
    },
    ...(features.length ? { features } : {}),
    ...(login ? { panel: login.panel } : {}),
  });
  return { site, trade, template, panelPassword: login?.plain };
}
