import { NextResponse } from "next/server";
import { AuditEventType, Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const EVENT_TYPES = new Set<string>(Object.values(AuditEventType));

export async function GET(req: Request) {
  try {
    const currentUser = await requireAdmin();
    if (!currentUser) {
      return NextResponse.json({ message: "Forbidden - Admin access required" }, { status: 403 });
    }

    const url = new URL(req.url);
    const email = url.searchParams.get("email")?.trim().toLowerCase();
    const event = url.searchParams.get("event")?.trim();
    const from = url.searchParams.get("from")?.trim();
    const to = url.searchParams.get("to")?.trim();

    if (event && !EVENT_TYPES.has(event)) {
      return NextResponse.json({ message: "Unknown event" }, { status: 400 });
    }

    const where: Prisma.AuditEventWhereInput = {};
    if (email) {
      where.OR = [{ actorEmail: email }, { targetEmail: email }];
    }
    if (event) where.eventType = event as AuditEventType;

    if (from || to) {
      const occurredAt: Prisma.DateTimeFilter = {};
      if (from) {
        const start = new Date(from);
        if (Number.isNaN(start.getTime())) {
          return NextResponse.json({ message: "Invalid from date" }, { status: 400 });
        }
        occurredAt.gte = start;
      }
      if (to) {
        const end = new Date(to);
        if (Number.isNaN(end.getTime())) {
          return NextResponse.json({ message: "Invalid to date" }, { status: 400 });
        }
        end.setHours(23, 59, 59, 999);
        occurredAt.lte = end;
      }
      where.occurredAt = occurredAt;
    }

    const events = await prisma.auditEvent.findMany({
      where,
      orderBy: { occurredAt: "desc" },
      take: 200,
    });

    return NextResponse.json({ events });
  } catch (error) {
    console.error("[AUDIT_LOGS]", error);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
