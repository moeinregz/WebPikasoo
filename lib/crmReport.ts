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
 *  the matching filter tab) visually says what happened at a glance.
 *
 *  This is the full/final set of outcomes on purpose — kept short so the
 *  filter tabs stay to exactly these plus "not called yet" (see
 *  NOT_CALLED_OPTION below). */
export type CrmCallResultOption = { label: string; colorClass: string };

export const CRM_CALL_RESULT_OPTIONS: CrmCallResultOption[] = [
  { label: "پاسخ نداد", colorClass: "border-yellow-500/40 bg-yellow-500/15 text-yellow-600" },
  { label: "قبول برای دیدن", colorClass: "border-emerald-500/40 bg-emerald-500/15 text-emerald-600" },
  { label: "قبول نکرد", colorClass: "border-red-500/40 bg-red-500/15 text-red-500" },
];

/** The lead hasn't been called yet — not one of the outcomes above (there's
 *  no call to have an outcome), but styled the same way so it can sit
 *  alongside them in the status dropdown and the filter tabs. */
export const CRM_NOT_CALLED_OPTION: CrmCallResultOption = {
  label: "زنگ نزده",
  colorClass: "border-gray-400/40 bg-gray-400/15 text-gray-500",
};

/** Tailwind classes for a given result label, falling back to a neutral
 *  color for anything not in the fixed list (shouldn't normally happen
 *  since results are chosen from the dropdown, not typed freely). */
export function getCrmResultColorClass(result: string): string {
  return CRM_CALL_RESULT_OPTIONS.find((o) => o.label === result)?.colorClass || CRM_NOT_CALLED_OPTION.colorClass;
}

/** Formats a "YYYY-MM-DD" key as a readable Persian-calendar date. */
export function formatTehranDayKey(dayKey: string): string {
  const d = new Date(`${dayKey}T12:00:00Z`); // noon avoids any DST/rounding edge cases
  return new Intl.DateTimeFormat("fa-IR", { dateStyle: "full", timeZone: "Asia/Tehran" }).format(d);
}
