// Client-safe SMS helpers: phone normalizing, part counting, message
// variables and the default texts per trade (editable in the SMS panel).
import { CRM_TYPE_GROUPS } from "./siteTemplates/crmMapping";

const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";

/** Any Iranian mobile written any way (۰۹۱۲..., +98912..., 0098 912 ...) → "09xxxxxxxxx"; landlines → null. */
export function toMobile(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let s = String(raw)
    .replace(/[۰-۹]/g, (d) => String(FA_DIGITS.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(AR_DIGITS.indexOf(d)))
    .replace(/[^\d+]/g, "");
  if (s.startsWith("+98")) s = "0" + s.slice(3);
  else if (s.startsWith("0098")) s = "0" + s.slice(4);
  else if (s.startsWith("98") && s.length === 12) s = "0" + s.slice(2);
  else if (s.startsWith("9") && s.length === 10) s = "0" + s;
  return /^09\d{9}$/.test(s) ? s : null;
}

/** SMS parts: Persian (UCS-2) 70 chars for one part, 67 per part after that. */
export function smsParts(text: string): { chars: number; parts: number } {
  const chars = Array.from(text).length;
  const unicode = /[^\x00-\x7F]/.test(text);
  const one = unicode ? 70 : 160;
  const multi = unicode ? 67 : 153;
  return { chars, parts: chars === 0 ? 0 : chars <= one ? 1 : Math.ceil(chars / multi) };
}

/** Required at the end of advertising SMS in Iran. */
export const OPT_OUT = "لغو۱۱";

export const SMS_VARS = { name: "{نام}", link: "{لینک}" } as const;

/** Fills {نام} and {لینک}, and makes sure the opt-out line is there. */
export function renderSms(template: string, vars: { name: string; link: string }): string {
  let t = template.replaceAll(SMS_VARS.name, vars.name.trim() || "دوست عزیز").replaceAll(SMS_VARS.link, vars.link);
  t = t.trim();
  if (!t.includes(OPT_OUT) && !t.includes("لغو11")) t = `${t}\n${OPT_OUT}`;
  return t;
}

/** A length estimate before codes exist: the link is a fixed-size short URL. */
export function previewSms(template: string, name = "کافه نمونه", linkLen = 24): string {
  return renderSms(template, { name, link: "x".repeat(linkLen) });
}

// Kept to 2 SMS parts (≤134 chars with the link and opt-out line): every
// extra part multiplies the cost of a campaign.
const BY_TRADE: Record<string, string> = {
  clinic: "{نام}، هنوز نوبت‌ها رو تلفنی می‌گیری؟ بیمارها آنلاین نوبت می‌گیرن. سایتت رو ببین:\n{لینک}",
  dental: "{نام}، بیمارای جدید دندانپزشک رو توی گوگل پیدا می‌کنن. سایت مطبت رو ببین:\n{لینک}",
  cafe: "{نام}، مشتری‌ها منوی کافه رو توی گوگل می‌گردن. کافه‌ت با منوی آنلاین این شکلی می‌شه:\n{لینک}",
  restaurant: "{نام}، هنوز سفارش‌ها فقط تلفنیه؟ سفارش آنلاین مستقیم از خودت:\n{لینک}",
  gym: "{نام}، شاگردای جدید باشگاه رو توی گوگل پیدا می‌کنن. سایت باشگاهت رو ببین:\n{لینک}",
  school: "{نام}، خانواده‌ها مدرسه رو آنلاین بررسی می‌کنن. سایت پیش‌ثبت‌نامتون رو ببینید:\n{لینک}",
  realestate: "{نام}، خریدارها اول فایل‌ها رو آنلاین می‌بینن. سایت املاکت رو ببین:\n{لینک}",
  law: "{نام}، موکل‌های جدید وکیل رو توی گوگل پیدا می‌کنن. سایت دفترت رو ببین:\n{لینک}",
};

const BY_GROUP: Record<string, string> = {
  "غذا و پذیرایی": "{نام}، مشتری‌ها منوت رو توی گوگل می‌گردن. منوی آنلاین و سفارش اینترنتی تو:\n{لینک}",
  "فروشگاه‌ها": "{نام}، فروشگاهت می‌تونه شب‌ها هم بفروشه! سایت فروشگاهی‌ت رو ببین:\n{لینک}",
  "سلامت و ورزش": "{نام}، مراجعه‌کننده‌ها آنلاین نوبت می‌گیرن. سایت نوبت‌دهی‌ت رو ببین:\n{لینک}",
  "خانه و آشپزخانه": "{نام}، مشتری‌ها قبل از خرید آنلاین مقایسه می‌کنن. سایت فروشگاهت رو ببین:\n{لینک}",
  "ابزار و خودرو": "{نام}، مشتری‌ها قطعه و ابزار رو توی گوگل می‌گردن. سایت فروشگاهت رو ببین:\n{لینک}",
  "خدمات و شرکتی": "{نام}، مشتری‌های جدید توی گوگل دنبالت می‌گردن. سایت اختصاصی‌ت رو ببین:\n{لینک}",
  "آموزش": "{نام}، ثبت‌نام‌های جدید از گوگل میان. سایت ثبت‌نام آنلاین آموزشگاهت رو ببین:\n{لینک}",
  "گردشگری و اقامت": "{نام}، مسافرها آنلاین رزرو می‌کنن. سایت رزرو آنلاین تو رو ببین:\n{لینک}",
};

export const DEFAULT_SMS = "{نام}، مشتری‌های جدیدت توی گوگل دنبالت می‌گردن. سایت اختصاصی‌ت رو ببین:\n{لینک}";

export function groupOfTrade(tradeId: string | null | undefined): string | null {
  if (!tradeId) return null;
  return CRM_TYPE_GROUPS.find((g) => g.tradeIds.includes(tradeId))?.label ?? null;
}

/** Suggested text for a trade (falls back to its group, then a general one). */
export function defaultSmsFor(tradeId: string | null | undefined): string {
  if (tradeId && BY_TRADE[tradeId]) return BY_TRADE[tradeId];
  const g = groupOfTrade(tradeId);
  return (g && BY_GROUP[g]) || DEFAULT_SMS;
}
