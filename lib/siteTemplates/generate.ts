import type { ColorRole, RoleColors, Trade } from "./trades";

export type SiteTemplate = {
  id: string;
  trade: string; // Trade.id
  label: string; // shown in the dropdown
  html: string; // template source with {{placeholders}}
  /** CSS custom properties in the template mapped to a color role, e.g.
   *  { "--gold": "primary", "--flour": "bg" }. Overridden at build time. */
  vars: Record<string, ColorRole>;
};

export type SiteInput = {
  brand: string;
  address: string;
  phones: string[]; // 1–3
  hours?: string; // optional
  primary?: string; // optional #hex — falls back to the trade default
  secondary?: string; // optional #hex — falls back to the trade default
};

export const HEX_COLOR = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

export function toFa(s: string): string {
  return s.replace(/[0-9]/g, (d) => FA_DIGITS[Number(d)]);
}

export function toEn(s: string): string {
  return s
    .replace(/[۰-۹]/g, (c) => String(FA_DIGITS.indexOf(c)))
    .replace(/[٠-٩]/g, (c) => String(c.charCodeAt(0) - 0x0660));
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** tel: link in international form (021… → +9821…, 0912… → +98912…). */
export function telHref(phone: string): string {
  let d = toEn(phone).replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  else if (d.startsWith("0")) d = "98" + d.slice(1);
  else if (d.length === 10 && d.startsWith("9")) d = "98" + d;
  return d ? `tel:+${d}` : "tel:";
}

export function resolveColors(trade: Trade, input: Pick<SiteInput, "primary" | "secondary">): RoleColors {
  const colors: RoleColors = { ...trade.colors };
  if (input.primary && HEX_COLOR.test(input.primary)) colors.primary = input.primary;
  if (input.secondary && HEX_COLOR.test(input.secondary)) colors.secondary = input.secondary;
  return colors;
}

function jalaliYear(): string {
  try {
    return new Intl.DateTimeFormat("fa-IR-u-ca-persian", { year: "numeric" }).format(new Date());
  } catch {
    return toFa(String(new Date().getFullYear()));
  }
}

/**
 * Template syntax (all optional, plain HTML so templates stay previewable):
 *
 *   {{brand}} {{brand_initial}} {{address}} {{hours}} {{trade}} {{year}} {{map_url}}
 *   {{phone}} {{phone_href}}            first number
 *   {{phone2}} {{phone2_href}}          second / third (empty if not given)
 *   {{phone3}} {{phone3_href}}
 *   {{color_primary}} {{color_secondary}} {{color_accent}} {{color_bg}} {{color_text}}
 *
 *   <!--if:hours-->…<!--/if:hours-->        kept only when the value exists
 *   <!--ifnot:hours-->…<!--/ifnot:hours-->  kept only when it doesn't
 *     (keys: brand, address, hours, phone, phone2, phone3)
 *   <!--each:phones-->…<!--/each:phones-->  repeated once per phone number,
 *     using {{phone}}, {{phone_href}} and {{phone_n}} inside the block
 */
export function renderSite(
  tpl: SiteTemplate,
  trade: Trade,
  input: SiteInput
): { html: string; unknown: string[] } {
  const phones = input.phones.map((p) => p.trim()).filter(Boolean).slice(0, 3);
  const brand = input.brand.trim();
  const address = input.address.trim();
  const hours = (input.hours ?? "").trim();
  const colors = resolveColors(trade, input);

  const present: Record<string, string> = {
    brand,
    address,
    hours,
    phone: phones[0] ?? "",
    phone2: phones[1] ?? "",
    phone3: phones[2] ?? "",
  };

  let out = tpl.html;

  // 1) conditional blocks (looped so blocks nested inside others resolve too)
  for (let i = 0; i < 8; i++) {
    const next = out
      .replace(/<!--if:(\w+)-->([\s\S]*?)<!--\/if:\1-->/g, (_m, k: string, body: string) => (present[k] ? body : ""))
      .replace(/<!--ifnot:(\w+)-->([\s\S]*?)<!--\/ifnot:\1-->/g, (_m, k: string, body: string) => (present[k] ? "" : body));
    if (next === out) break;
    out = next;
  }

  // 2) repeated phone blocks
  out = out.replace(/<!--each:phones-->([\s\S]*?)<!--\/each:phones-->/g, (_m, body: string) =>
    phones
      .map((p, i) =>
        body
          .replace(/\{\{phone_href\}\}/g, esc(telHref(p)))
          .replace(/\{\{phone\}\}/g, esc(toFa(p)))
          .replace(/\{\{phone_n\}\}/g, String(i + 1))
      )
      .join("")
  );

  // 3) simple values
  const map: Record<string, string> = {
    brand: esc(brand),
    brand_initial: esc(Array.from(brand)[0] ?? ""),
    address: esc(toFa(address)),
    hours: esc(toFa(hours)),
    trade: esc(trade.label),
    year: esc(jalaliYear()),
    map_url: esc(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${brand} ${address}`)}`),
    phone: esc(toFa(phones[0] ?? "")),
    phone_href: esc(phones[0] ? telHref(phones[0]) : ""),
    phone2: esc(toFa(phones[1] ?? "")),
    phone2_href: esc(phones[1] ? telHref(phones[1]) : ""),
    phone3: esc(toFa(phones[2] ?? "")),
    phone3_href: esc(phones[2] ? telHref(phones[2]) : ""),
    color_primary: colors.primary,
    color_secondary: colors.secondary,
    color_accent: colors.accent,
    color_bg: colors.bg,
    color_text: colors.text,
  };
  const unknown: string[] = [];
  out = out.replace(/\{\{(\w+)\}\}/g, (_m, k: string) => {
    if (k in map) return map[k];
    unknown.push(k);
    return "";
  });

  // 4) theme override: the template's own CSS variables get the chosen colors
  const decl = Object.entries(tpl.vars)
    .map(([cssVar, role]) => `${cssVar}:${colors[role]};`)
    .join("");
  if (decl) {
    const tag = `<style id="sitegen-theme">:root{${decl}}</style>`;
    out = /<\/head>/i.test(out) ? out.replace(/<\/head>/i, `${tag}\n</head>`) : tag + out;
  }

  return { html: out, unknown };
}
