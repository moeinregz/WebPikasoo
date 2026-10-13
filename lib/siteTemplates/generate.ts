import type { ColorRole, RoleColors, Trade } from "./trades";

export type SiteTemplate = {
  id: string;
  trade: string; // Trade.id
  label: string; // shown in the dropdown
  html: string; // template source with {{placeholders}}
  /** CSS custom properties in the template mapped to a color role, e.g.
   *  { "--gold": "primary", "--flour": "bg" }. Overridden at build time. */
  vars?: Record<string, ColorRole>;
  /** The template's own signature colors (what it looks like with no color
   *  chosen). When the admin picks a color, every color in the template that
   *  belongs to the same hue family is re-themed toward it ({{t:#hex}}). */
  palette?: { primary: string; secondary?: string };
};

export type SiteInput = {
  brand: string;
  address: string;
  phones: string[]; // 1–3
  hours?: string; // optional
  primary?: string; // optional #hex — falls back to the trade default
  secondary?: string; // optional #hex — falls back to the trade default
  instagram?: string; // optional: @name, name or profile URL
  whatsapp?: string; // optional: phone number
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

/** Instagram handle from "@name", "name" or a profile URL; null if invalid. */
export function normalizeInstagram(raw: string): string | null {
  let v = raw.trim();
  if (!v) return null;
  const m = /instagram\.com\/([A-Za-z0-9._]+)/i.exec(v);
  if (m) v = m[1];
  v = v.replace(/^@/, "").replace(/\/+$/, "");
  return /^[A-Za-z0-9._]{1,30}$/.test(v) ? v : null;
}

/** wa.me number (country code, digits only) from a local or international phone. */
export function whatsappNumber(phone: string): string | null {
  let d = toEn(phone).replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  else if (d.startsWith("0")) d = "98" + d.slice(1);
  else if (d.length === 10 && d.startsWith("9")) d = "98" + d;
  return d.length >= 10 && d.length <= 15 ? d : null;
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

// ---------------------------------------------------------------------------
// Derived colors. A template can write {{c:EXPR}} anywhere (CSS, inline style,
// SVG) and get a hex color computed from the brand's palette, so one color
// choice re-themes the whole page instead of just one spot.
//   EXPR := primary | secondary | accent | bg | text | white | black | #hex
//         | mix(A,B,t)   blend A→B, t = 0..1   (0.3 = 30% of B)
//         | ink(A)       whichever of `text` / `bg` reads better on top of A
//         | best(A,B,C…) whichever of B, C… has the most contrast against A
//         | pref(A,min,B,C…) the first of B, C… with contrast ≥ min against A,
//                          else the one with the most contrast
// ---------------------------------------------------------------------------
type RGB = [number, number, number];

function hexToRgb(h: string): RGB {
  let x = h.replace("#", "");
  if (x.length === 3) x = x.split("").map((c) => c + c).join("");
  return [parseInt(x.slice(0, 2), 16), parseInt(x.slice(2, 4), 16), parseInt(x.slice(4, 6), 16)];
}

function rgbToHex(c: RGB): string {
  return (
    "#" +
    c
      .map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

function luminance(c: RGB): number {
  const [r, g, b] = c.map((v) => {
    const x = v / 255;
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(a: RGB, b: RGB): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function splitArgs(s: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let cur = "";
  for (const ch of s) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "," && depth === 0) {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out.map((x) => x.trim());
}

function evalColor(expr: string, colors: RoleColors): RGB {
  const e = expr.trim();
  const fn = /^(\w+)\((.*)\)$/.exec(e);
  if (fn) {
    const args = splitArgs(fn[2]);
    if (fn[1] === "mix" && args.length === 3) {
      const a = evalColor(args[0], colors);
      const b = evalColor(args[1], colors);
      const t = Math.max(0, Math.min(1, Number(args[2])));
      if (Number.isNaN(t)) throw new Error("bad mix amount");
      return [0, 1, 2].map((i) => a[i] * (1 - t) + b[i] * t) as RGB;
    }
    if (fn[1] === "ink" && args.length === 1) {
      const base = evalColor(args[0], colors);
      const dark = hexToRgb(colors.text);
      const light = hexToRgb(colors.bg);
      return contrastRatio(base, dark) >= contrastRatio(base, light) ? dark : light;
    }
    if (fn[1] === "best" && args.length >= 2) {
      const base = evalColor(args[0], colors);
      const cands = args.slice(1).map((a) => evalColor(a, colors));
      return cands.reduce((top, cur) => (contrastRatio(base, cur) > contrastRatio(base, top) ? cur : top));
    }
    if (fn[1] === "pref" && args.length >= 3) {
      const base = evalColor(args[0], colors);
      const min = Number(args[1]);
      if (Number.isNaN(min)) throw new Error("bad contrast minimum");
      const cands = args.slice(2).map((a) => evalColor(a, colors));
      const ok = cands.find((cand) => contrastRatio(base, cand) >= min);
      return ok ?? cands.reduce((top, cur) => (contrastRatio(base, cur) > contrastRatio(base, top) ? cur : top));
    }
    throw new Error(`unknown function ${fn[1]}`);
  }
  if (e === "white") return [255, 255, 255];
  if (e === "black") return [0, 0, 0];
  if (HEX_COLOR.test(e)) return hexToRgb(e);
  if (e in colors) return hexToRgb(colors[e as ColorRole]);
  throw new Error(`unknown color ${e}`);
}

// ---------------------------------------------------------------------------
// Re-theming ({{t:#hex}} / {{t:rgba(r,g,b,a)}}). A template written with its
// own colors keeps them exactly when no color is chosen. When a primary or
// secondary color is chosen, every template color in that hue family is
// rotated/rescaled toward it (lightness steps are preserved, so tints stay
// tints and text keeps its contrast); neutrals and unrelated hues stay put.
// ---------------------------------------------------------------------------
type HSL = [number, number, number]; // h 0-360, s 0-1, l 0-1

function rgbToHsl([r, g, b]: RGB): HSL {
  const R = r / 255, G = g / 255, B = b / 255;
  const max = Math.max(R, G, B), min = Math.min(R, G, B);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return [0, 0, l];
  const sat = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = max === R ? (G - B) / d + (G < B ? 6 : 0) : max === G ? (B - R) / d + 2 : (R - G) / d + 4;
  h *= 60;
  return [h, sat, l];
}

function hslToRgb([h, s, l]: HSL): RGB {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = (((h % 360) + 360) % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  const [r1, g1, b1] =
    hp < 1 ? [c, x, 0] : hp < 2 ? [x, c, 0] : hp < 3 ? [0, c, x] : hp < 4 ? [0, x, c] : hp < 5 ? [x, 0, c] : [c, 0, x];
  const m = l - c / 2;
  return [(r1 + m) * 255, (g1 + m) * 255, (b1 + m) * 255];
}

function hueDist(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

function parseColorToken(tok: string): { rgb: RGB; alpha: string | null } | null {
  const t = tok.trim();
  if (HEX_COLOR.test(t)) return { rgb: hexToRgb(t), alpha: null };
  const m = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)$/.exec(t);
  if (m) return { rgb: [Number(m[1]), Number(m[2]), Number(m[3])], alpha: m[4] ?? null };
  return null;
}

function themeColor(tok: string, tpl: SiteTemplate, input: Pick<SiteInput, "primary" | "secondary">): string {
  const pal = tpl.palette;
  const parsed = parseColorToken(tok);
  if (!pal || !parsed) return tok;
  const families: { from: HSL; to: HSL }[] = [];
  const addFamily = (orig?: string, next?: string) => {
    if (!orig || !next || !HEX_COLOR.test(next) || next.toLowerCase() === orig.toLowerCase()) return;
    families.push({ from: rgbToHsl(hexToRgb(orig)), to: rgbToHsl(hexToRgb(next)) });
  };
  addFamily(pal.primary, input.primary);
  addFamily(pal.secondary, input.secondary);
  if (families.length === 0) return tok;

  const [h, s, l] = rgbToHsl(parsed.rgb);
  if (s < 0.1) return tok; // neutrals (blacks, whites, greys) never change
  // nearest family by hue; colors far from every family keep their color
  let best: { from: HSL; to: HSL } | null = null;
  let bestD = 46;
  for (const f of families) {
    const d = hueDist(h, f.from[0]);
    if (d < bestD) {
      bestD = d;
      best = f;
    }
  }
  if (!best) return tok;
  const [h0, s0, l0] = best.from;
  const [hn, sn, ln] = best.to;
  const k = Math.max(0, 1 - 1.6 * Math.abs(l - l0));
  const out = hslToRgb([
    h + (hn - h0),
    Math.max(0, Math.min(1, s0 > 0.02 ? s * (sn / s0) : sn)),
    Math.max(0, Math.min(1, l + (ln - l0) * k)),
  ]);
  const hex = rgbToHex(out);
  if (parsed.alpha === null) return hex;
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${parsed.alpha})`;
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
 *   {{brand}} {{brand_initial}} {{address}} {{hours}} {{trade}} {{year}} {{map_url}} {{map_q}}
 *   {{phone}} {{phone_href}}            first number
 *   {{phone2}} {{phone2_href}}          second / third (empty if not given)
 *   {{phone3}} {{phone3_href}}
 *   {{wa:?text=…}}                     WhatsApp link with prefilled text (phone link if no WhatsApp)
 *   {{instagram}} {{instagram_href}} {{whatsapp}} {{whatsapp_href}}   (optional; use <!--if:instagram--> etc.)
 *   {{t:#hex}} {{t:rgba(r,g,b,a)}}      the template's own color, re-themed when the admin picks colors
 *   {{brand_first}} {{brand_rest}}      first word / the remaining words of the brand
 *   {{color_primary}} {{color_secondary}} {{color_accent}} {{color_bg}} {{color_text}}
 *   {{c:mix(primary,black,0.3)}} {{c:ink(accent)}}   derived colors (see above)
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

  const brandWords = brand.split(/\s+/).filter(Boolean);
  const brandFirst = brandWords[0] ?? "";
  const brandRest = brandWords.slice(1).join(" ");

  const present: Record<string, string> = {
    brand,
    brand_rest: brandRest,
    address,
    hours,
    phone: phones[0] ?? "",
    phone2: phones[1] ?? "",
    phone3: phones[2] ?? "",
  };
  const igHandle = normalizeInstagram(input.instagram ?? "");
  const waNumber = input.whatsapp ? whatsappNumber(input.whatsapp) : null;
  present.instagram = igHandle ?? "";
  present.whatsapp = waNumber ? (input.whatsapp ?? "").trim() : "";
  present.social = igHandle || waNumber ? "1" : "";

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

  // 2b) {{wa:?text}} → WhatsApp link (optionally with a prefilled message);
  //     falls back to a phone-call link when no WhatsApp number was given
  out = out.replace(/\{\{wa:([^}]*)\}\}/g, (_m, q: string) =>
    esc(waNumber ? `https://wa.me/${waNumber}${q.replace(/^\?/, "") ? `?${q.replace(/^\?/, "")}` : ""}` : phones[0] ? telHref(phones[0]) : "#")
  );

  // 3) simple values
  const map: Record<string, string> = {
    brand: esc(brand),
    brand_initial: esc(Array.from(brand)[0] ?? ""),
    brand_first: esc(brandFirst),
    brand_rest: esc(brandRest),
    address: esc(toFa(address)),
    hours: esc(toFa(hours)),
    trade: esc(trade.label),
    year: esc(jalaliYear()),
    map_url: esc(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${brand} ${address}`)}`),
    map_q: esc(encodeURIComponent(`${brand} ${address}`)),
    phone: esc(toFa(phones[0] ?? "")),
    phone_href: esc(phones[0] ? telHref(phones[0]) : ""),
    phone2: esc(toFa(phones[1] ?? "")),
    phone2_href: esc(phones[1] ? telHref(phones[1]) : ""),
    phone3: esc(toFa(phones[2] ?? "")),
    phone3_href: esc(phones[2] ? telHref(phones[2]) : ""),
    instagram: esc(igHandle ? `@${igHandle}` : ""),
    instagram_href: esc(igHandle ? `https://instagram.com/${igHandle}` : ""),
    whatsapp: esc(toFa(present.whatsapp)),
    whatsapp_href: esc(waNumber ? `https://wa.me/${waNumber}` : ""),
    color_primary: colors.primary,
    color_secondary: colors.secondary,
    color_accent: colors.accent,
    color_bg: colors.bg,
    color_text: colors.text,
  };
  const unknown: string[] = [];
  out = out.replace(/\{\{t:([^}]+)\}\}/g, (_m, tok: string) => themeColor(tok, tpl, input));
  out = out.replace(/\{\{c:([^}]+)\}\}/g, (_m, expr: string) => {
    try {
      return rgbToHex(evalColor(expr, colors));
    } catch {
      unknown.push(`c:${expr}`);
      return "#000000";
    }
  });
  out = out.replace(/\{\{(\w+)\}\}/g, (_m, k: string) => {
    if (k in map) return map[k];
    unknown.push(k);
    return "";
  });

  // 4) theme override: the template's own CSS variables get the chosen colors
  const decl = Object.entries(tpl.vars ?? {})
    .map(([cssVar, role]) => `${cssVar}:${colors[role]};`)
    .join("");
  if (decl) {
    const tag = `<style id="sitegen-theme">:root{${decl}}</style>`;
    out = /<\/head>/i.test(out) ? out.replace(/<\/head>/i, `${tag}\n</head>`) : tag + out;
  }

  return { html: out, unknown };
}
