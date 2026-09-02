// Kept separate from lib/db.ts (same reasoning as lib/projectLink.ts) so it
// stays safe to import from "use client" components — this is plain date
// math with no server-only dependencies.

/** Turns a stored "YYYY-MM-DD HH:MM:SS" UTC timestamp into a "YYYY-MM-DD"
 *  calendar-day key in Iran's timezone, so a call made at 11:45 PM Tehran
 *  time doesn't get bucketed into the next UTC day. */
export function tehranDayKey(storedUtc: string): string {
  const d = new Date(storedUtc.replace(" ", "T") + "Z");
  // en-CA formats as YYYY-MM-DD, which is exactly the sortable key we want.
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tehran" }).format(d);
}

/** Today's date, as the same "YYYY-MM-DD" key, in Iran's timezone. */
export function todayTehranKey(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tehran" }).format(new Date());
}

/** Quick pick-list for a call's outcome — a dropdown is faster than typing
 *  and doesn't force the admin to stop and write a sentence just to mark
 *  someone as called. */
export const CRM_CALL_RESULT_OPTIONS = [
  "پاسخ نداد",
  "خاموش / در دسترس نبود",
  "علاقه‌مند بود",
  "علاقه نداشت",
  "بعداً دوباره تماس بگیر",
  "مشتری شد",
  "شماره اشتباه",
];

/** Formats a "YYYY-MM-DD" key as a readable Persian-calendar date. */
export function formatTehranDayKey(dayKey: string): string {
  const d = new Date(`${dayKey}T12:00:00Z`); // noon avoids any DST/rounding edge cases
  return new Intl.DateTimeFormat("fa-IR", { dateStyle: "full", timeZone: "Asia/Tehran" }).format(d);
}
