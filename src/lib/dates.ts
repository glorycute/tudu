/**
 * Date helpers. Calendar dates are plain "YYYY-MM-DD" strings so they never
 * shift with the browser's timezone. "Today" is always computed in the
 * user's chosen timezone (from their profile).
 */

export type ISODate = string;

export function todayIn(timeZone: string): ISODate {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

const toUTC = (iso: ISODate) => new Date(`${iso}T00:00:00Z`);
const fromUTC = (d: Date): ISODate => d.toISOString().slice(0, 10);

export function addDays(iso: ISODate, n: number): ISODate {
  const d = toUTC(iso);
  d.setUTCDate(d.getUTCDate() + n);
  return fromUTC(d);
}

/** 0 = Sunday ... 6 = Saturday */
export function dayOfWeek(iso: ISODate): number {
  return toUTC(iso).getUTCDay();
}

export function startOfWeek(iso: ISODate, weekStartsOn: 0 | 1): ISODate {
  return addDays(iso, -((dayOfWeek(iso) - weekStartsOn + 7) % 7));
}

export function startOfMonth(iso: ISODate): ISODate {
  return `${iso.slice(0, 7)}-01`;
}

export function addMonths(iso: ISODate, n: number): ISODate {
  const d = toUTC(startOfMonth(iso));
  d.setUTCMonth(d.getUTCMonth() + n);
  return fromUTC(d);
}

export function endOfMonth(iso: ISODate): ISODate {
  return addDays(addMonths(iso, 1), -1);
}

export function isValidISODate(s: string | null | undefined): s is ISODate {
  return !!s && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(toUTC(s).getTime()) && fromUTC(toUTC(s)) === s;
}

export function formatDate(iso: ISODate, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", ...options }).format(toUTC(iso));
}

/** "9 Nov · Today · Monday" style label. */
export function dayLabel(iso: ISODate, today: ISODate): string {
  const parts = [formatDate(iso, { day: "numeric", month: "short" })];
  if (iso === today) parts.push("Today");
  else if (iso === addDays(today, 1)) parts.push("Tomorrow");
  else if (iso === addDays(today, -1)) parts.push("Yesterday");
  parts.push(formatDate(iso, { weekday: "long" }));
  return parts.join(" · ");
}

/** Short relative label for a task's date, e.g. "Today", "Tomorrow", "Mon, 2 Nov". */
export function shortDateLabel(iso: ISODate, today: ISODate): string {
  if (iso === today) return "Today";
  if (iso === addDays(today, 1)) return "Tomorrow";
  if (iso === addDays(today, -1)) return "Yesterday";
  const sameYear = iso.slice(0, 4) === today.slice(0, 4);
  return formatDate(iso, { weekday: "short", day: "numeric", month: "short", ...(sameYear ? {} : { year: "numeric" }) });
}

/**
 * A finished day stays editable for this many days (48 hours), then its tasks lock.
 * Must match public.lock_grace_days() in the database.
 */
export const LOCK_GRACE_DAYS = 2;

/** True when tasks scheduled on this date are read-only. Undated (Inbox) tasks never lock. */
export function isLockedDate(date: ISODate | null, today: ISODate): boolean {
  return date !== null && date < addDays(today, -LOCK_GRACE_DAYS);
}
