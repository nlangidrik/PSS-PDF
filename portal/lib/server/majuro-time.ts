/** Pacific/Majuro is UTC+12 and does not observe daylight saving. */
const MAJURO_OFFSET_MS = 12 * 60 * 60 * 1000;
const WEEKDAY_INDEX: Record<string, number> = {
  Mon: 0,
  Tue: 1,
  Wed: 2,
  Thu: 3,
  Fri: 4,
  Sat: 5,
  Sun: 6,
};

export type MajuroDate = {
  year: number;
  month: number;
  day: number;
  /** 0 = Monday … 6 = Sunday. */
  weekdayIndex: number;
};

export function majuroCalendarDate(now: Date): MajuroDate {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Pacific/Majuro",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).formatToParts(now);
  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  const weekdayIndex = WEEKDAY_INDEX[value("weekday")];
  if (weekdayIndex === undefined) {
    throw new Error(`Unexpected Majuro weekday: ${value("weekday")}`);
  }
  return {
    year: Number(value("year")),
    month: Number(value("month")),
    day: Number(value("day")),
    weekdayIndex,
  };
}

/** Midnight at the start of this calendar day in Pacific/Majuro, as a UTC instant. */
export function majuroStartOfDay(date: MajuroDate): Date {
  return new Date(Date.UTC(date.year, date.month - 1, date.day) - MAJURO_OFFSET_MS);
}

export function addMajuroDays(date: MajuroDate, days: number): MajuroDate {
  const shifted = new Date(Date.UTC(date.year, date.month - 1, date.day + days));
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    weekdayIndex: (((date.weekdayIndex + days) % 7) + 7) % 7,
  };
}

export function majuroDayKey(date: MajuroDate): string {
  const month = String(date.month).padStart(2, "0");
  const day = String(date.day).padStart(2, "0");
  return `${date.year}-${month}-${day}`;
}

const DAY_TEXT = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Parse `YYYY-MM-DD` as a Pacific/Majuro calendar day. Invalid dates return null. */
export function parseMajuroDay(value: string): MajuroDate | null {
  const match = DAY_TEXT.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const check = new Date(Date.UTC(year, month - 1, day));
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    return null;
  }
  return { year, month, day, weekdayIndex: 0 };
}

/**
 * Inclusive From/To bounds for a calendar day in Pacific/Majuro.
 * A To of 2026-11-28 includes events through 23:59:59.999 that day, not UTC midnight.
 */
export function majuroInclusiveDayRange(
  from?: string,
  to?: string,
): { gte?: Date; lte?: Date } | "invalid" {
  const range: { gte?: Date; lte?: Date } = {};
  if (from) {
    const start = parseMajuroDay(from);
    if (!start) return "invalid";
    range.gte = majuroStartOfDay(start);
  }
  if (to) {
    const end = parseMajuroDay(to);
    if (!end) return "invalid";
    range.lte = new Date(majuroStartOfDay(addMajuroDays(end, 1)).getTime() - 1);
  }
  return range;
}

export function formatMajuro(instant: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Pacific/Majuro",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(instant);
}
