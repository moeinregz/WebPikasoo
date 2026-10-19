// Pure helpers for the attendance / work-report feature. No server-only APIs,
// so both the server (db.ts, actions) and the client panels import from here.
//
// Times are stored like everywhere else in the app: UTC "YYYY-MM-DD HH:MM:SS".
// "Day" (the attendance day a record belongs to) is the calendar date in
// Tehran, as "YYYY-MM-DD" — so a 00:30 clock-out still belongs to the shift
// that started the evening before only if the person clocks it that way; we
// simply never split a record across days.

export const TEHRAN_TZ = "Asia/Tehran";
// Iran stopped using daylight saving in 2022: Tehran is a fixed UTC+03:30.
const TEHRAN_OFFSET = "+03:30";

export const DEFAULT_WORK_HOURS = { start: "09:00", end: "17:00" };

const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const faNum = (n: number | string) => String(n).replace(/[0-9]/g, (d) => FA_DIGITS[Number(d)]);

/** "YYYY-MM-DD" for the given instant, in Tehran. */
export function tehranDay(d: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TEHRAN_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/** Adds (or subtracts) whole days to a "YYYY-MM-DD" string. */
export function shiftDay(day: string, delta: number): string {
  const d = new Date(`${day}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

export const isDayString = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(new Date(`${s}T12:00:00Z`).getTime());
export const isTimeString = (s: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(s);

/** Tehran wall-clock (day + "HH:MM") → stored UTC string. */
export function tehranToUtc(day: string, hhmm: string): string {
  return new Date(`${day}T${hhmm}:00${TEHRAN_OFFSET}`).toISOString().slice(0, 19).replace("T", " ");
}

export const utcToMs = (utc: string) => new Date(utc.replace(" ", "T") + "Z").getTime();
export const nowUtcStr = () => new Date().toISOString().slice(0, 19).replace("T", " ");

/** "HH:MM" (Tehran) of a stored UTC time — for pre-filling <input type="time">. */
export function tehranHHMM(utc: string): string {
  return new Intl.DateTimeFormat("en-GB", { timeZone: TEHRAN_TZ, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(
    new Date(utc.replace(" ", "T") + "Z")
  );
}

export function fmtTime(utc: string): string {
  return new Intl.DateTimeFormat("fa-IR", { timeZone: TEHRAN_TZ, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(
    new Date(utc.replace(" ", "T") + "Z")
  );
}

/** Persian calendar date of an attendance/report day. */
export function fmtDay(day: string, withWeekday = true): string {
  return new Intl.DateTimeFormat("fa-IR", {
    timeZone: "UTC",
    ...(withWeekday ? { weekday: "long" as const } : {}),
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${day}T12:00:00Z`));
}

export function fmtDateTime(utc: string): string {
  return new Intl.DateTimeFormat("fa-IR", { timeZone: TEHRAN_TZ, dateStyle: "medium", timeStyle: "short", hourCycle: "h23" }).format(
    new Date(utc.replace(" ", "T") + "Z")
  );
}

/** 125 → "۲ ساعت و ۵ دقیقه". */
export function fmtMinutes(total: number): string {
  const m = Math.max(0, Math.round(total));
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h === 0) return `${faNum(r)} دقیقه`;
  if (r === 0) return `${faNum(h)} ساعت`;
  return `${faNum(h)} ساعت و ${faNum(r)} دقیقه`;
}

export type SessionLike = { check_in: string; check_out: string | null };

/** Length of one session in minutes; an open session counts up to `nowMs`. */
export function sessionMinutes(s: SessionLike, nowMs: number = Date.now()): number {
  const end = s.check_out ? utcToMs(s.check_out) : nowMs;
  return Math.max(0, (end - utcToMs(s.check_in)) / 60000);
}

/** Minutes the first check-in of a day was after the official start (0 = on time). */
export function lateMinutes(firstCheckIn: string, day: string, start: string): number {
  return Math.max(0, Math.round((utcToMs(firstCheckIn) - utcToMs(tehranToUtc(day, start))) / 60000));
}

/** Minutes the last check-out of a day was before the official end (0 = stayed the full time). */
export function earlyMinutes(lastCheckOut: string, day: string, end: string): number {
  return Math.max(0, Math.round((utcToMs(tehranToUtc(day, end)) - utcToMs(lastCheckOut)) / 60000));
}
