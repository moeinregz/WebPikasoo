// Client-safe (no template HTML, no DB): decides which site-generator trades
// fit a CRM lead. The CRM only has nine broad "نوع کسب‌وکار" categories, while
// the generator has finer trades (کافه، دندانپزشکی، …), so the lead's NAME is
// checked for trade keywords first; only if nothing matches do we fall back to
// every trade in the lead's category and let the template pick be random.

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

export type TradeGuess = {
  tradeIds: string[];
  /** how the trades were found; null = nothing to go on */
  source: "name" | "category" | null;
};

export function detectTrades(name: string, businessType: string): TradeGuess {
  const n = norm(name);
  for (const [trade, words] of KEYWORDS) {
    if (words.some((w) => n.includes(norm(w)))) return { tradeIds: [trade], source: "name" };
  }
  const byCategory = CRM_CATEGORY_TRADES[businessType];
  if (byCategory?.length) return { tradeIds: byCategory, source: "category" };
  return { tradeIds: [], source: null };
}
