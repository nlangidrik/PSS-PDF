import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { PROTECTED_ADMIN_EMAIL } from "@/lib/protected-admin";
import { getClientIp, writeAuditEvent } from "@/lib/server/audit";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request) {
  try {
    const currentUser = await requireAdmin();
    if (!currentUser) {
      return NextResponse.json({ message: "Forbidden - Admin access required" }, { status: 403 });
    }

    const body = (await req.json()) as { email?: string };
    const email = body.email?.trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }
    if (email === PROTECTED_ADMIN_EMAIL) {
      return NextResponse.json({ message: "This account cannot be deleted" }, { status: 403 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.deletedAt) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const deletedAt = new Date();
    await prisma.user.update({
      where: { email },
      data: { deletedAt, isActive: false },
    });

    await writeAuditEvent({
      eventType: "USER_SOFT_DELETED",
      actorEmail: currentUser.email,
      actorName: currentUser.name,
      targetEmail: email,
      ipAddress: getClientIp(req),
      metadata: { deletedAt: deletedAt.toISOString() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE_USER]", error);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
