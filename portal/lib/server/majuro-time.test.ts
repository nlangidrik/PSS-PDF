import { describe, expect, it } from "vitest";
import { majuroCalendarDate, majuroDayKey, majuroInclusiveDayRange, majuroStartOfDay } from "./majuro-time";

describe("Majuro calendar", () => {
  it("treats 12:00 UTC as midnight the same calendar day", () => {
    const midnight = new Date("2026-11-27T12:00:00.000Z");
    const date = majuroCalendarDate(midnight);
    expect(majuroDayKey(date)).toBe("2026-11-28");
    expect(date.weekdayIndex).toBe(5);
    expect(majuroStartOfDay(date).toISOString()).toBe("2026-11-27T12:00:00.000Z");
  });

  it("keeps the previous calendar day one minute earlier", () => {
    const date = majuroCalendarDate(new Date("2026-11-27T11:59:00.000Z"));
    expect(majuroDayKey(date)).toBe("2026-11-27");
  });

  it("includes the whole To day in Pacific/Majuro and starts From at local midnight", () => {
    const range = majuroInclusiveDayRange("2026-11-28", "2026-11-28");
    expect(range).not.toBe("invalid");
    if (range === "invalid") return;

    expect(range.gte?.toISOString()).toBe("2026-11-27T12:00:00.000Z");
    expect(range.lte?.toISOString()).toBe("2026-11-28T11:59:59.999Z");

    const lateEvening = new Date("2026-11-28T11:59:59.000Z");
    const nextMidnight = new Date("2026-11-28T12:00:00.000Z");
    expect(lateEvening.getTime()).toBeGreaterThanOrEqual(range.gte!.getTime());
    expect(lateEvening.getTime()).toBeLessThanOrEqual(range.lte!.getTime());
    expect(nextMidnight.getTime()).toBeGreaterThan(range.lte!.getTime());
  });

  it("starts the week on Monday", () => {
    const saturday = majuroCalendarDate(new Date("2026-11-27T12:00:00.000Z"));
    const monday = majuroStartOfDay({ ...saturday, day: saturday.day - saturday.weekdayIndex, weekdayIndex: 0 });
    expect(monday.toISOString()).toBe("2026-11-22T12:00:00.000Z");
  });
});
