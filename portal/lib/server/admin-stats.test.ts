import { beforeEach, describe, expect, it, vi } from "vitest";

const { prisma } = vi.hoisted(() => ({
  prisma: {
    user: { count: vi.fn() },
    auditEvent: { count: vi.fn(), groupBy: vi.fn(), findMany: vi.fn() },
    usageEvent: { count: vi.fn(), findMany: vi.fn() },
    $queryRaw: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma }));

import { getAdminStats } from "./admin-stats";

describe("getAdminStats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prisma.user.count.mockResolvedValue(4);
    prisma.auditEvent.groupBy.mockResolvedValue([{ actorEmail: "a@pss.edu.mh" }, { actorEmail: "b@pss.edu.mh" }]);
    prisma.auditEvent.count.mockResolvedValueOnce(1).mockResolvedValueOnce(3).mockResolvedValueOnce(5);
    prisma.usageEvent.count.mockResolvedValue(0);
    prisma.$queryRaw.mockResolvedValueOnce([]).mockResolvedValueOnce([]).mockResolvedValueOnce([{ bytes: 0 }]);
  });

  it("counts users and logins and does not invent file totals", async () => {
    const stats = await getAdminStats(new Date("2026-11-27T20:00:00.000Z"));

    expect(stats.users).toEqual({ total: 4, activeThisMonth: 2 });
    expect(stats.logins).toEqual({ today: 1, thisWeek: 3, thisMonth: 5 });
    expect(stats.files.processedAllTime).toBe(0);
    expect(stats.files.savedOnServer).toBeNull();
    expect(stats.storage.usedBytes).toBeNull();
    expect(stats.storage.limitBytes).toBeNull();
    expect(stats.toolRunsReported).toBe(false);
    expect(stats.perDay).toHaveLength(30);
    expect(stats.perDay.every((day) => day.count === 0)).toBe(true);
    expect(stats.topTools).toEqual([]);
  });
});
