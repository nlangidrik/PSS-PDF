import { prisma } from "@/lib/prisma";
import { AuditEventType, Prisma } from "@prisma/client";

export async function writeAuditEvent(params: {
  eventType: AuditEventType;
  actorEmail?: string | null;
  actorName?: string | null;
  targetEmail?: string | null;
  ipAddress?: string | null;
  metadata?: Record<string, unknown>;
}) {
  return prisma.auditEvent.create({
    data: {
      eventType: params.eventType,
      actorEmail: params.actorEmail ?? null,
      actorName: params.actorName ?? null,
      targetEmail: params.targetEmail ?? null,
      ipAddress: params.ipAddress ?? null,
      metadata: (params.metadata as Prisma.InputJsonValue | undefined) ?? undefined,
    },
  });
}

function normalizeIp(ip: string): string {
  const trimmed = ip.trim();
  if (trimmed.toLowerCase().startsWith("::ffff:")) {
    return trimmed.slice(7);
  }
  return trimmed;
}

export function getClientIp(req: Request): string | null {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return normalizeIp(first);
  }

  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp) return normalizeIp(realIp);

  const socketIp = (req as Request & { ip?: string }).ip?.trim();
  if (socketIp) return normalizeIp(socketIp);

  return null;
}
