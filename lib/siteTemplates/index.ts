import type { SiteTemplate } from "./generate";
import cafeAdra from "./templates/cafe-adra.template.html";

// ---------------------------------------------------------------------------
// Template registry. To add a template: put the HTML in ./templates as
// `<name>.template.html` (see EXAMPLE.template.html for the placeholder
// syntax), import it below and add an entry. `trade` must match an id in
// ./trades.ts; `vars` maps the template's CSS variables to color roles so
// the brand's colors (or the trade's defaults) can replace them.
// ---------------------------------------------------------------------------

export const TEMPLATES: SiteTemplate[] = [
  {
    id: "cafe-adra",
    trade: "cafe",
    label: "کافه — رنگارنگ و شاد (آدرا)",
    html: cafeAdra,
    // Colors are derived inside the template with {{c:...}} expressions, so
    // no CSS-variable mapping is needed here.
    vars: {},
  },
  // {
  //   id: "cafe-1",
  //   trade: "cafe",
  //   label: "کافه — گرم و کلاسیک",
  //   html: cafe1,
  //   vars: { "--brown": "primary", "--cream": "bg", "--ink": "text", "--caramel": "accent" },
  // },
];

export function templatesForTrade(tradeId: string): SiteTemplate[] {
  return TEMPLATES.filter((t) => t.trade === tradeId);
}

/** A specific template, or a random one of the trade when none is chosen. */
export function pickTemplate(tradeId: string, templateId?: string): SiteTemplate | null {
  const list = templatesForTrade(tradeId);
  if (list.length === 0) return null;
  if (templateId) return list.find((t) => t.id === templateId) ?? null;
  return list[Math.floor(Math.random() * list.length)];
}

/** Metadata only (safe to hand to a client component). */
export function templateOptions() {
  return TEMPLATES.map((t) => ({ id: t.id, trade: t.trade, label: t.label }));
}
