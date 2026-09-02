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
 *  someone as called. Each option carries its own color so the button (and
 *  the matching filter tab) visually says what happened at a glance. */
export type CrmCallResultOption = { label: string; colorClass: string };

export const CRM_CALL_RESULT_OPTIONS: CrmCallResultOption[] = [
  { label: "پاسخ نداد", colorClass: "border-yellow-500/40 bg-yellow-500/15 text-yellow-600" },
  { label: "خاموش / در دسترس نبود", colorClass: "border-yellow-500/40 bg-yellow-500/15 text-yellow-600" },
  { label: "علاقه‌مند بود", colorClass: "border-emerald-500/40 bg-emerald-500/15 text-emerald-600" },
  { label: "علاقه نداشت", colorClass: "border-red-500/40 bg-red-500/15 text-red-500" },
  { label: "بعداً دوباره تماس بگیر", colorClass: "border-sky-500/40 bg-sky-500/15 text-sky-600" },
  { label: "مشتری شد", colorClass: "border-accent/40 bg-accent/15 text-accent" },
  { label: "شماره اشتباه", colorClass: "border-ink/[0.25] bg-ink/10 text-dim" },
];

/** Tailwind classes for a given result label, falling back to a neutral
 *  color for anything not in the fixed list (shouldn't normally happen
 *  since results are chosen from the dropdown, not typed freely). */
export function getCrmResultColorClass(result: string): string {
  return CRM_CALL_RESULT_OPTIONS.find((o) => o.label === result)?.colorClass || "border-ink/[0.2] text-dim";
}

/** Formats a "YYYY-MM-DD" key as a readable Persian-calendar date. */
export function formatTehranDayKey(dayKey: string): string {
  const d = new Date(`${dayKey}T12:00:00Z`); // noon avoids any DST/rounding edge cases
  return new Intl.DateTimeFormat("fa-IR", { dateStyle: "full", timeZone: "Asia/Tehran" }).format(d);
}
