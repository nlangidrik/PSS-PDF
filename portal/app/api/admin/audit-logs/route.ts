import { NextResponse } from "next/server";
import { AuditEventType, Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/auth-helpers";
import { parseActivityPage, parseActivityPageSize } from "@/lib/server/activity-page";
import { listAuditEvents } from "@/lib/server/audit-log-page";
import { majuroInclusiveDayRange } from "@/lib/server/majuro-time";

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
    const pageSize = parseActivityPageSize(url.searchParams.get("size"));
    const requestedPage = parseActivityPage(url.searchParams.get("page"));

    if (event && !EVENT_TYPES.has(event)) {
      return NextResponse.json({ message: "Unknown event" }, { status: 400 });
    }

    const where: Prisma.AuditEventWhereInput = {};
    if (email) {
      where.OR = [{ actorEmail: email }, { targetEmail: email }];
    }
    if (event) where.eventType = event as AuditEventType;

    if (from || to) {
      const range = majuroInclusiveDayRange(from || undefined, to || undefined);
      if (range === "invalid") {
        return NextResponse.json({ message: "Invalid date" }, { status: 400 });
      }
      where.occurredAt = range;
    }

    const result = await listAuditEvents({ where, page: requestedPage, pageSize });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[AUDIT_LOGS]", error);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
