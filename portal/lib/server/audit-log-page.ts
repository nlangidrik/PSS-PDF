import { Prisma } from "@prisma/client";
import { clampActivityPage } from "@/lib/server/activity-page";
import { prisma } from "@/lib/prisma";

export async function listAuditEvents(args: {
  where: Prisma.AuditEventWhereInput;
  page: number;
  pageSize: number;
}) {
  return prisma.$transaction(
    async (tx) => {
      const total = await tx.auditEvent.count({ where: args.where });
      const page = clampActivityPage(args.page, total, args.pageSize);
      const events = await tx.auditEvent.findMany({
        where: args.where,
        orderBy: { occurredAt: "desc" },
        skip: (page - 1) * args.pageSize,
        take: args.pageSize,
      });
      return { events, total, page, size: args.pageSize };
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
  );
}
