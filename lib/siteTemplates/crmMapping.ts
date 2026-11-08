// Client-safe (no template HTML, no DB): decides which site-generator trades
// fit a CRM lead.
//
// A lead's "نوع کسب‌وکار" is now one of the trade labels (CRM_BUSINESS_TYPES),
// which maps 1:1 to a generator trade. Leads saved before that still carry one
// of the nine old broad categories (CRM_CATEGORY_TRADES); for those the lead's
// NAME is checked for trade keywords first, then every trade of the old
// category is a candidate and the template pick is random.
import { TRADES } from "./trades";

/** The type picker in the CRM, grouped so the choices stay easy to scan. */
export const CRM_TYPE_GROUPS: { label: string; tradeIds: string[] }[] = [
  { label: "غذا و پذیرایی", tradeIds: ["cafe", "restaurant", "garden", "kebab", "fastfood", "bakery", "pastry", "icecream", "jigar", "breakfast", "coffeedist"] },
  { label: "فروشگاه‌ها", tradeIds: ["shop", "fashion", "jewelry", "watch", "carpet", "cosmetics", "perfume", "womenswear", "accessories", "shoes", "bags", "footwear", "lingerie", "menunder", "kidswear", "fabric", "bookstore", "stationery"] },
  { label: "دیجیتال و موبایل", tradeIds: ["mobile", "digital"] },
  { label: "سلامت و ورزش", tradeIds: ["dental", "clinic", "gym"] },
  { label: "خانه و آشپزخانه", tradeIds: ["appliances", "kitchenware", "melamine", "plastics", "bedding"] },
  { label: "ابزار و خودرو", tradeIds: ["tools", "autoparts"] },
  { label: "خدمات و شرکتی", tradeIds: ["upholstery", "moving", "realestate", "law"] },
  { label: "آموزش", tradeIds: ["language", "music", "school"] },
  { label: "گردشگری و اقامت", tradeIds: ["travel", "hotel"] },
  { label: "تفریح و سرگرمی", tradeIds: ["funcenter"] },
];

const labelOf = (id: string) => TRADES.find((t) => t.id === id)?.label ?? id;

/** Same groups, as the label strings stored in a lead's business_type. */
export const CRM_TYPE_GROUPS_LABELED: { label: string; types: string[] }[] = CRM_TYPE_GROUPS.map((g) => ({
  label: g.label,
  types: g.tradeIds.map(labelOf),
}));

export const CRM_BUSINESS_TYPES: string[] = CRM_TYPE_GROUPS_LABELED.flatMap((g) => g.types);

export const CRM_CATEGORY_TRADES: Record<string, string[]> = {
  "رستوران و کافه": ["cafe", "restaurant", "fastfood", "bakery", "pastry", "icecream", "jigar", "breakfast"],
  "فروشگاه و ای‌کامرس": ["shop", "carpet", "fashion", "jewelry", "watch", "womenswear", "accessories", "shoes", "bags", "footwear", "lingerie", "menunder", "bookstore", "stationery", "tools", "autoparts", "kitchenware", "melamine", "plastics", "bedding", "appliances", "digital", "mobile", "kidswear", "fabric"],
  "لوازم آرایشی و بهداشتی": ["cosmetics", "perfume"],
  "پزشکی و کلینیک": ["clinic", "dental"],
  "املاک و مستغلات": ["realestate"],
  "آموزشی": ["language", "music", "school"],
  "خدماتی": ["upholstery", "moving", "gym", "funcenter"],
  "شرکتی و کسب‌وکار": ["law", "coffeedist"],
  "گردشگری و اقامتی": ["travel", "hotel", "funcenter"],
};

// Most specific first — the first trade with a matching keyword wins.
const KEYWORDS: [string, string[]][] = [
  ["coffeedist", ["پخش قهوه", "توزیع قهوه", "قهوه عمده", "عمده قهوه", "بنکداری قهوه", "رست قهوه", "رُست قهوه", "روستری", "رستری"]],
  ["breakfast", ["صبحانه", "صبحونه", "صبحانه‌سرا", "صبحانه سرا", "حلیم", "عدسی", "کله‌پاچه", "کله پاچه", "طباخی", "breakfast"]],
  ["funcenter", ["مرکز تفریحی", "شهربازی", "شهر بازی", "سرزمین بازی", "خانه بازی", "خانه‌ی بازی", "پارک بازی", "پلی لند", "پلی‌لند", "بولینگ", "لیزرتگ", "اتاق فرار", "گیم نت", "گیم‌نت", "مجموعه تفریحی", "تفریحی"]],
  ["fabric", ["پارچه", "پارچه‌فروشی", "پارچه فروشی", "بزازی", "بزاز", "حریر", "مخمل", "پارچه چادری", "پارچه مانتویی", "پرده و پارچه"]],
  ["kidswear", ["پوشاک بچگانه", "لباس بچگانه", "بچگانه", "لباس کودک", "پوشاک کودک", "لباس نوزاد", "نوزادی", "سیسمونی", "سیسمونی‌سرا"]],
  ["mobile", ["موبایل", "گوشی", "لپ‌تاپ", "لپتاپ", "لپ تاپ", "تبلت", "آیفون", "ایفون", "سامسونگ", "شیائومی", "اپل"]],
  ["digital", ["کالای دیجیتال", "دیجیتال", "ساعت هوشمند", "لوازم جانبی", "گجت", "هدفون", "اسپیکر", "کنسول", "پلی‌استیشن", "گیمینگ", "کامپیوتر", "رایانه"]],
  ["appliances", ["لوازم خانگی", "لوازم برقی", "لوازم خانگی برقی", "یخچال", "لباسشویی", "ظرفشویی", "جاروبرقی", "تلویزیون", "اجاق گاز", "کولر", "بخاری"]],
  ["jigar", ["جگرکی", "جیگرکی", "جگرسرا", "جیگرسرا", "جگر", "جیگر", "دل و قلوه"]],
  ["lingerie", ["لباس زیر زنانه", "لانژری", "لباس خواب زنانه", "سوتین", "شورت زنانه"]],
  ["menunder", ["زیرپوش", "لباس زیر مردانه", "شورت مردانه"]],
  ["melamine", ["ملامین"]],
  ["plastics", ["پلاسکو", "پلاستیک", "لوازم پلاستیکی"]],
  ["kitchenware", ["ظروف", "لوازم آشپزخانه", "چینی", "بلور", "کریستال"]],
  ["upholstery", ["مبل‌شویی", "مبلشویی", "قالیشویی", "قالی‌شویی", "شستشوی مبل"]],
  ["bedding", ["کالای خواب", "سرویس خواب", "تشک فروشی", "تشک طبی", "پتو", "روتختی", "لحاف", "بالش"]],
  ["moving", ["باربری", "اسباب‌کشی", "اسبابکشی", "حمل‌ونقل", "حمل و نقل"]],
  ["dental", ["دندان", "ارتودنسی"]],
  ["law", ["وکیل", "وکالت", "حقوقی"]],
  ["realestate", ["املاک", "مستغلات"]],
  ["autoparts", ["لوازم یدکی", "یدکی", "قطعات خودرو", "لوازم خودرو", "روغن موتور", "لنت", "باتری خودرو"]],
  ["tools", ["ابزارآلات", "ابزار", "یراق", "یراق‌آلات", "پیچ و مهره", "ابزار برقی", "رنگ و ابزار"]],
  ["shoes", ["کیف و کفش"]],
  ["footwear", ["کفش", "کتونی", "اسنیکر"]],
  ["bags", ["کیف فروشی", "گالری کیف", "کیف و کوله", "کیف چرم", "کیف زنانه", "کیف مردانه", "چرم"]],
  ["accessories", ["اکسسوری", "اکسسوریز", "بدلیجات", "بدلی", "زیورآلات", "عینک"]],
  ["jewelry", ["طلافروشی", "طلا و جواهر", "جواهر", "زرگری"]],
  ["watch", ["ساعت"]],
  ["carpet", ["فرش"]],
  ["perfume", ["عطر", "ادکلن", "ادوکلن", "پرفیوم", "دکانت"]],
  ["cosmetics", ["آرایشی", "آرایش", "پوست"]],
  ["music", ["موسیقی", "گیتار", "پیانو"]],
  ["language", ["زبان", "آیلتس"]],
  ["school", ["مدرسه", "دبستان", "دبیرستان", "پیش‌دبستانی", "پیش دبستانی", "غیرانتفاعی", "غیر انتفاعی", "مهدکودک"]],
  ["travel", ["آژانس", "مسافرتی", "مسافرت"]],
  ["hotel", ["هتل", "مهمانپذیر", "اقامتگاه", "هاستل", "بوم‌گردی"]],
  ["gym", ["باشگاه", "بدنسازی", "ورزش", "کراس‌فیت", "یوگا"]],
  ["clinic", ["کلینیک", "درمانگاه", "مطب", "فیزیوتراپی", "آزمایشگاه"]],
  ["womenswear", ["مزون", "مانتو", "زنانه", "لباس مجلسی", "لباس عروس", "خیاطی زنانه"]],
  ["fashion", ["لباس", "پوشاک", "بوتیک"]],
  ["icecream", ["بستنی", "آبمیوه"]],
  ["pastry", ["شیرینی", "قنادی", "شکلات"]],
  ["bakery", ["نانوایی", "نانوا"]],
  ["fastfood", ["فست", "برگر", "پیتزا", "ساندویچ", "سوخاری"]],
  ["garden", ["باغ"]], // باغ رستوران، باغچه، باغ‌طور
  ["kebab", ["کبابی", "چلوکبابی", "کباب‌سرا", "کبابسرا", "کباب سرا", "کباب"]],
  ["cafe", ["کافه", "قهوه", "کافی", "cafe", "coffee"]],
  ["restaurant", ["رستوران", "سفره", "غذا"]],
  ["stationery", ["لوازم التحریر", "لوازم‌التحریر", "نوشت‌افزار", "نوشت افزار", "لوازم مدرسه", "تحریر"]],
  ["bookstore", ["کتاب", "نشر"]],
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
  const byName = tradeFromName(name);
  if (exact) {
    // A generic «رستوران» whose name says more (باغ رستوران، کبابی…) gets that trade.
    if (exact.id === "restaurant" && (byName === "garden" || byName === "kebab")) {
      return { tradeIds: [byName], source: "name" };
    }
    return { tradeIds: [exact.id], source: "type" };
  }

  if (byName) return { tradeIds: [byName], source: "name" };
  const byCategory = CRM_CATEGORY_TRADES[businessType];
  if (byCategory?.length) return { tradeIds: byCategory, source: "category" };
  return { tradeIds: [], source: null };
}
