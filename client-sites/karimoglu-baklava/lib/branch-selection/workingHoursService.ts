import type { BranchSummary } from "@/lib/types";

/**
 * طبق اطلاعات واقعی کسب‌وکار: همه شعب «۰۸:۰۰ تا ۲۴:۰۰» باز هستند. این سرویس
 * رشته ساعت کاری را Parse می‌کند تا بعداً اگر ساعت کاری شعبه‌ای متفاوت شد
 * (مثلاً شعبه همدان)، فقط داده تغییر کند، نه منطق.
 */
const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

function toAsciiDigits(input: string): string {
  return input.replace(/[۰-۹]/g, (ch) => String(PERSIAN_DIGITS.indexOf(ch)));
}

function parseHourString(value: string): number {
  const [h, m] = toAsciiDigits(value)
    .split(":")
    .map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

export function isBranchOpenNow(branch: BranchSummary, now: Date = new Date()): boolean {
  const normalizedHours = toAsciiDigits(branch.openingHours);
  const match = normalizedHours.match(/(\d{1,2}:\d{2})\s*تا\s*(\d{1,2}:\d{2})/);
  if (!match) return true; // در نبود فرمت قابل‌تشخیص، محافظه‌کارانه رد نمی‌کنیم؛ TODO بررسی دستی

  const opensAt = parseHourString(match[1]!);
  // «۲۴:۰۰» یعنی پایان روز؛ به‌صورت ۱۴۴۰ دقیقه (پایان بازه) تفسیر می‌شود
  const rawCloses = parseHourString(match[2]!);
  const closesAt = rawCloses === 0 ? 24 * 60 : rawCloses;

  const nowMinutes = getMinutesInTehran(now);
  return nowMinutes >= opensAt && nowMinutes < closesAt;
}

/**
 * ⚠️ نکته حیاتی: سرور می‌تواند در هر Timezone‌ای اجرا شود (مثلاً UTC)، اما
 * ساعت کاری شعب («۰۸:۰۰ تا ۲۴:۰۰») بر مبنای زمان محلی ایران است. استفاده
 * ساده از `now.getHours()` (که بر اساس Timezone سرور است) می‌تواند باعث شود
 * سیستم در نیمی از ساعات واقعی کاری، همه شعب را «بسته» تشخیص دهد. به همین
 * دلیل ساعت همیشه صراحتاً با `Intl.DateTimeFormat` در Timezone `Asia/Tehran`
 * محاسبه می‌شود، مستقل از Timezone محیط اجرا.
 */
function getMinutesInTehran(date: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tehran",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  return hour * 60 + minute;
}

export function isBranchActive(branch: BranchSummary): boolean {
  return branch.status === "active";
}
