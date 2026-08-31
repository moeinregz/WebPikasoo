// Kept in its own file (instead of lib/db.ts) specifically so it stays
// import-safe from "use client" components — lib/db.ts pulls in the
// MongoDB driver at module scope, which can't be bundled for the browser.

export type ProjectLinkType = "url" | "html";

/** Where a "مشاهده" click should actually go: our own /portfolio/view/[id]
 *  for uploaded HTML files (so it opens on our domain), or straight to the
 *  external url otherwise. Shared by the homepage/portfolio mappings and
 *  the dashboard's ProjectsPanel so they all stay in sync. */
export function projectViewUrl(p: { id: number; url: string; linkType: ProjectLinkType }): string {
  return p.linkType === "html" ? `/portfolio/view/${p.id}` : p.url;
}
