import { AuditEventType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  addMajuroDays,
  majuroCalendarDate,
  majuroDayKey,
  majuroStartOfDay,
  type MajuroDate,
} from "@/lib/server/majuro-time";

const LOGIN_EVENTS = [AuditEventType.SIGN_IN, AuditEventType.ADMIN_LOGIN] as const;

export type DayCount = {
  date: string;
  count: number;
};

export type AdminStats = {
  users: { total: number; activeThisMonth: number };
  logins: { today: number; thisWeek: number; thisMonth: number };
  files: {
    processedThisMonth: number;
    processedAllTime: number;
    savedOnServer: null;
    note: string;
  };
  storage: {
    processedThisMonthBytes: number;
    usedBytes: null;
    limitBytes: null;
    note: string;
  };
  perDay: DayCount[];
  topTools: { tool: string; count: number }[];
  toolRunsReported: boolean;
};

type DayRow = { day: string; count: number };
type ToolRow = { action: string; count: number };
type ByteRow = { bytes: bigint | number | null };

function loginWhere(since: Date) {
  return {
    eventType: { in: [...LOGIN_EVENTS] },
    occurredAt: { gte: since },
  };
}

function last30Days(today: MajuroDate): MajuroDate[] {
  return Array.from({ length: 30 }, (_, index) => addMajuroDays(today, index - 29));
}

export async function getAdminStats(now = new Date()): Promise<AdminStats> {
  const today = majuroCalendarDate(now);
  const startToday = majuroStartOfDay(today);
  const startWeek = majuroStartOfDay(addMajuroDays(today, -today.weekdayIndex));
  const startMonth = majuroStartOfDay({ ...today, day: 1, weekdayIndex: 0 });
  const startChart = majuroStartOfDay(addMajuroDays(today, -29));

  const [
    totalUsers,
    activeUsers,
    loginsToday,
    loginsWeek,
    loginsMonth,
    processedAllTime,
    processedThisMonth,
    dayRows,
    toolRows,
    byteRows,
  ] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.auditEvent.groupBy({
      by: ["actorEmail"],
      where: { ...loginWhere(startMonth), actorEmail: { not: null } },
    }),
    prisma.auditEvent.count({ where: loginWhere(startToday) }),
    prisma.auditEvent.count({ where: loginWhere(startWeek) }),
    prisma.auditEvent.count({ where: loginWhere(startMonth) }),
    prisma.usageEvent.count(),
    prisma.usageEvent.count({ where: { occurredAt: { gte: startMonth } } }),
    prisma.$queryRaw<DayRow[]>`
      SELECT to_char((timezone('Pacific/Majuro', "occurredAt"))::date, 'YYYY-MM-DD') AS day,
             COUNT(*)::int AS count
      FROM "UsageEvent"
      WHERE "occurredAt" >= ${startChart}
      GROUP BY 1
      ORDER BY 1
    `,
    prisma.$queryRaw<ToolRow[]>`
      SELECT "action", COUNT(*)::int AS count
      FROM "UsageEvent"
      WHERE "occurredAt" >= ${startMonth}
      GROUP BY "action"
      ORDER BY COUNT(*) DESC
      LIMIT 8
    `,
    prisma.$queryRaw<ByteRow[]>`
      SELECT COALESCE(SUM("fileSizeBytes"), 0)::bigint AS bytes
      FROM "UsageEvent"
      WHERE "occurredAt" >= ${startMonth}
    `,
  ]);

  const countByDay = new Map(dayRows.map((row) => [row.day, Number(row.count)] as const));

  const processedBytes = Number(byteRows[0]?.bytes ?? 0);
  const toolRunsReported = processedAllTime > 0;

  return {
    users: { total: totalUsers, activeThisMonth: activeUsers.length },
    logins: { today: loginsToday, thisWeek: loginsWeek, thisMonth: loginsMonth },
    files: {
      processedThisMonth,
      processedAllTime,
      savedOnServer: null,
      note: toolRunsReported
        ? "Counts include only tool runs reported to the portal."
        : "No tool runs have been reported. Earlier work in the editor is not included.",
    },
    storage: {
      processedThisMonthBytes: processedBytes,
      usedBytes: null,
      limitBytes: null,
      note: "PDFs stay in the browser. The server does not keep a copy, so there is no storage total or quota.",
    },
    perDay: last30Days(today).map((date) => ({
      date: majuroDayKey(date),
      count: countByDay.get(majuroDayKey(date)) ?? 0,
    })),
    topTools: toolRows.map((row) => ({ tool: row.action, count: Number(row.count) })),
    toolRunsReported,
  };
}
