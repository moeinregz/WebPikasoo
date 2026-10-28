import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getPrivateSiteByToken, listSiteRequests } from "@/lib/db";
import { hasPanelAccess } from "@/lib/panelAuth";
import { apiOrigin, brandOfSite, menuOfSite, menuUrlOf } from "@/lib/siteTemplates/siteAddon";
import PanelClient, { PanelLogin } from "./PanelClient";

// The owner's management panel (webpikaso.ir/panel/<token>): orders, bookings,
// appointments, menu editing and the QR code. Password-protected; never indexed.
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "پنل مدیریت",
  robots: { index: false, follow: false, nocache: true },
  referrer: "no-referrer",
};

function origin(): string {
  const h = headers();
  const host = h.get("x-forwarded-host") || h.get("host");
  if (!host) return apiOrigin();
  const proto = h.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export default async function PanelPage({ params }: { params: { token: string } }) {
  if (!/^[A-Za-z0-9_-]{8,64}$/.test(params.token)) notFound();
  const site = await getPrivateSiteByToken(params.token);
  if (!site || !site.features?.includes("panel")) notFound();

  const brand = brandOfSite(site);
  // The root layout adds site chrome (sticky CTA…); the panel covers it with its own full-screen shell.
  const shell = "fixed inset-0 z-[100] overflow-y-auto bg-canvas text-ink";

  if (!(await hasPanelAccess(site))) {
    return (
      <div className={shell}>
        <PanelLogin token={site.token} brand={brand} />
      </div>
    );
  }

  const base = origin();
  const requests = await listSiteRequests(site.id);
  return (
    <div className={shell}>
      <PanelClient
        token={site.token}
        brand={brand}
        features={site.features}
        initialRequests={requests}
        menu={menuOfSite(site)}
        menuCustom={!!site.menu}
        menuUrl={menuUrlOf(site.token, base)}
        siteUrl={`${base}/preview/${site.token}`}
      />
    </div>
  );
}
