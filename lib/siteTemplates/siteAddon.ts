// Server-only glue: turns a stored private site into the add-on block that is
// spliced into its page (preview, download) — and into the data the QR-menu
// page needs. Pure data in, strings out; no request objects.
import type { PrivateSite } from "@/lib/db";
import { buildAddon, injectAddon } from "./addon";
import { hasFeature, needsMenu, type FeatureId } from "./features";
import type { MenuCategory } from "./menu";
import { defaultMenuFor } from "./menus.starter";
import { mainColorOfTemplate, templateIdOfSite, tradeOfTemplate } from "./index";
import { getTrade } from "./trades";

/** Origin of the webpikaso server (what the add-on posts to). Falls back to the
 *  configured public URL so a downloaded .html still reaches us. */
export function apiOrigin(requestOrigin?: string): string {
  const env = (process.env.NEXT_PUBLIC_SITE_URL || "https://webpikaso.ir").replace(/\/$/, "");
  return (requestOrigin || env).replace(/\/$/, "");
}

/** The site's real name without the « (صنف)» suffix buildPrivateSite appends. */
export function brandOfSite(site: Pick<PrivateSite, "name" | "meta">): string {
  if (site.meta?.brand) return site.meta.brand;
  return site.name.replace(/\s*\([^()]*\)\s*$/, "").trim() || site.name;
}

export function tradeIdOfSite(site: Pick<PrivateSite, "template_id" | "note">): string | undefined {
  return tradeOfTemplate(templateIdOfSite(site));
}

/** The menu the add-on (order form, QR menu) works with: the edited one, else the
 *  template's own default, else the trade's starter menu. */
export function menuOfSite(site: Pick<PrivateSite, "menu" | "template_id" | "note">): MenuCategory[] {
  if (site.menu && site.menu.length) return site.menu;
  const tid = templateIdOfSite(site);
  return defaultMenuFor(tid, tradeOfTemplate(tid));
}

export function siteColor(site: Pick<PrivateSite, "meta" | "template_id" | "note">): string {
  if (site.meta?.color) return site.meta.color;
  const tid = templateIdOfSite(site);
  const own = mainColorOfTemplate(tid);
  if (own) return own;
  return getTrade(tradeOfTemplate(tid) ?? "")?.colors.primary ?? "#8B1E2D";
}

export function menuUrlOf(token: string, origin: string): string {
  return `${apiOrigin(origin)}/m/${token}`;
}

/** The add-on HTML for a site ("" when it has no features). `menuOverride` lets the
 *  download route pass a menu whose photos are embedded. */
export function addonHtmlForSite(site: PrivateSite, origin: string, menuOverride?: MenuCategory[]): string {
  const features = (site.features ?? []) as FeatureId[];
  if (features.length === 0) return "";
  return buildAddon({
    token: site.token,
    features,
    brand: brandOfSite(site),
    phone: site.meta?.phone,
    whatsapp: site.meta?.whatsapp,
    color: siteColor(site),
    api: apiOrigin(origin),
    menu: needsMenu(features) ? (menuOverride ?? menuOfSite(site)) : undefined,
    menuUrl: hasFeature(features, "qrmenu") ? menuUrlOf(site.token, origin) : undefined,
  });
}

/** Adds (or refreshes / removes) the add-on in a site's HTML. */
export function withAddon(html: string, site: PrivateSite, origin: string, menuOverride?: MenuCategory[]): string {
  return injectAddon(html, addonHtmlForSite(site, origin, menuOverride));
}
