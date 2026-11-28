import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getClientIp, writeAuditEvent } from "@/lib/server/audit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return new NextResponse(null, { status: 401 });
  }

  try {
    await writeAuditEvent({
      eventType: "SIGN_OUT",
      actorEmail: session.user.email,
      actorName: session.user.name,
      ipAddress: getClientIp(req),
    });
  } catch (error) {
    console.error("[LOGOUT]", error);
  }

  return new NextResponse(null, { status: 204 });
}
