// Client-safe (no template HTML, no DB): decides which site-generator trades
// fit a CRM lead.
//
// A lead's "نوع کسب‌وکار" is now one of the 23 trade labels (CRM_BUSINESS_TYPES),
// which maps 1:1 to a generator trade. Leads saved before that still carry one
// of the nine old broad categories (CRM_CATEGORY_TRADES); for those the lead's
// NAME is checked for trade keywords first, then every trade of the old
// category is a candidate and the template pick is random.
import { TRADES } from "./trades";

/** The type picker in the CRM, grouped so 23 choices stay easy to scan. */
export const CRM_TYPE_GROUPS: { label: string; tradeIds: string[] }[] = [
  { label: "غذا و پذیرایی", tradeIds: ["cafe", "restaurant", "fastfood", "bakery", "pastry", "icecream"] },
  { label: "فروشگاه‌ها", tradeIds: ["shop", "fashion", "jewelry", "watch", "carpet", "cosmetics"] },
  { label: "سلامت و ورزش", tradeIds: ["dental", "clinic", "gym"] },
  { label: "خدمات و شرکتی", tradeIds: ["upholstery", "moving", "realestate", "law"] },
  { label: "آموزش", tradeIds: ["language", "music"] },
  { label: "گردشگری و اقامت", tradeIds: ["travel", "hotel"] },
];

const labelOf = (id: string) => TRADES.find((t) => t.id === id)?.label ?? id;

/** Same groups, as the label strings stored in a lead's business_type. */
export const CRM_TYPE_GROUPS_LABELED: { label: string; types: string[] }[] = CRM_TYPE_GROUPS.map((g) => ({
  label: g.label,
  types: g.tradeIds.map(labelOf),
}));

export const CRM_BUSINESS_TYPES: string[] = CRM_TYPE_GROUPS_LABELED.flatMap((g) => g.types);

export const CRM_CATEGORY_TRADES: Record<string, string[]> = {
  "رستوران و کافه": ["cafe", "restaurant", "fastfood", "bakery", "pastry", "icecream"],
  "فروشگاه و ای‌کامرس": ["shop", "carpet", "fashion", "jewelry", "watch"],
  "لوازم آرایشی و بهداشتی": ["cosmetics"],
  "پزشکی و کلینیک": ["clinic", "dental"],
  "املاک و مستغلات": ["realestate"],
  "آموزشی": ["language", "music"],
  "خدماتی": ["upholstery", "moving", "gym"],
  "شرکتی و کسب‌وکار": ["law"],
  "گردشگری و اقامتی": ["travel", "hotel"],
};

// Most specific first — the first trade with a matching keyword wins.
const KEYWORDS: [string, string[]][] = [
  ["upholstery", ["مبل‌شویی", "مبلشویی", "قالیشویی", "قالی‌شویی", "شستشوی مبل"]],
  ["moving", ["باربری", "اسباب‌کشی", "اسبابکشی", "حمل‌ونقل", "حمل و نقل"]],
  ["dental", ["دندان", "ارتودنسی"]],
  ["law", ["وکیل", "وکالت", "حقوقی"]],
  ["realestate", ["املاک", "مستغلات"]],
  ["jewelry", ["طلافروشی", "طلا و جواهر", "جواهر", "زرگری"]],
  ["watch", ["ساعت"]],
  ["carpet", ["فرش"]],
  ["cosmetics", ["آرایشی", "آرایش", "عطر", "پوست"]],
  ["music", ["موسیقی", "گیتار", "پیانو"]],
  ["language", ["زبان", "آیلتس"]],
  ["travel", ["آژانس", "مسافرتی", "مسافرت"]],
  ["hotel", ["هتل", "مهمانپذیر", "اقامتگاه", "هاستل", "بوم‌گردی"]],
  ["gym", ["باشگاه", "بدنسازی", "ورزش", "کراس‌فیت", "یوگا"]],
  ["clinic", ["کلینیک", "درمانگاه", "مطب", "فیزیوتراپی", "آزمایشگاه"]],
  ["fashion", ["لباس", "پوشاک", "بوتیک", "مزون", "مانتو"]],
  ["icecream", ["بستنی", "آبمیوه"]],
  ["pastry", ["شیرینی", "قنادی", "شکلات"]],
  ["bakery", ["نانوایی", "نانوا"]],
  ["fastfood", ["فست", "برگر", "پیتزا", "ساندویچ", "سوخاری"]],
  ["cafe", ["کافه", "قهوه", "کافی", "cafe", "coffee"]],
  ["restaurant", ["رستوران", "کبابی", "چلوکبابی", "سفره", "غذا"]],
  ["shop", ["فروشگاه", "شاپ", "مارکت"]],
];

/** Lower-case, unify Arabic/Persian letter forms, drop spaces and ZWNJ. */
function norm(s: string): string {
  return s
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[\u200c\s]+/g, "")
    .toLowerCase();
}

/** The trade whose keyword appears in a business name, if any. */
export function tradeFromName(name: string): string | null {
  const n = norm(name);
  for (const [trade, words] of KEYWORDS) {
    if (words.some((w) => n.includes(norm(w)))) return trade;
  }
  return null;
}

export type TradeGuess = {
  tradeIds: string[];
  /** how the trades were found; null = nothing to go on */
  source: "type" | "name" | "category" | null;
};

export function detectTrades(name: string, businessType: string): TradeGuess {
  // An explicitly chosen trade always wins.
  const exact = TRADES.find((t) => t.label === businessType);
  if (exact) return { tradeIds: [exact.id], source: "type" };

  const byName = tradeFromName(name);
  if (byName) return { tradeIds: [byName], source: "name" };
  const byCategory = CRM_CATEGORY_TRADES[businessType];
  if (byCategory?.length) return { tradeIds: byCategory, source: "category" };
  return { tradeIds: [], source: null };
}

// ---------------------------------------------------------------------------
// One-time move of leads that still carry one of the nine OLD broad categories
// onto the 23 trades. Pure and deterministic, so the dashboard can preview it
// and the server recomputes the very same plan when applying it.
// ---------------------------------------------------------------------------
export type TypeChange = {
  id: number;
  from: string; // previous business_type ("" if it had none)
  to: string; // new business_type (a trade label)
  how: "name" | "single" | "spread";
};

export function planCrmTypeMigration(
  leads: { id: number; name: string; business_type: string }[],
  opts: { spread: boolean }
): TypeChange[] {
  const out: TypeChange[] = [];
  // Oldest first, and a per-category counter for the spread, so the result is
  // perfectly even and stable no matter how the ids happen to be distributed.
  const spreadCount = new Map<string, number>();
  for (const l of [...leads].sort((a, b) => a.id - b.id)) {
    const bt = (l.business_type ?? "").trim();
    if (CRM_BUSINESS_TYPES.includes(bt)) continue; // already one of the 23
    const candidates = CRM_CATEGORY_TRADES[bt];
    if (bt !== "" && !candidates) continue; // unknown custom value: leave alone

    // 1) the name itself says what the business is
    const byName = tradeFromName(l.name);
    if (byName) {
      out.push({ id: l.id, from: bt, to: labelOf(byName), how: "name" });
      continue;
    }
    if (!candidates) continue; // no type and no clue in the name
    // 2) the old category only allows one trade
    if (candidates.length === 1) {
      out.push({ id: l.id, from: bt, to: labelOf(candidates[0]), how: "single" });
      continue;
    }
    // 3) ambiguous: deal them out round-robin across the category's trades —
    //    a guess the admin can still correct by hand
    if (opts.spread) {
      const n = spreadCount.get(bt) ?? 0;
      spreadCount.set(bt, n + 1);
      out.push({ id: l.id, from: bt, to: labelOf(candidates[n % candidates.length]), how: "spread" });
    }
  }
  return out;
}
