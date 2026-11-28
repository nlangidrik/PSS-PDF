import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { PROTECTED_ADMIN_EMAIL } from "@/lib/protected-admin";
import { getClientIp, writeAuditEvent } from "@/lib/server/audit";

export const dynamic = "force-dynamic";

function forbidden() {
  return NextResponse.json({ message: "Forbidden - Admin access required" }, { status: 403 });
}

export async function PATCH(req: Request) {
  try {
    const currentUser = await requireAdmin();
    if (!currentUser) return forbidden();

    const body = (await req.json()) as { email?: string; role?: string; isActive?: boolean };
    const email = body.email?.trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.deletedAt) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const nextRole = body.role;
    const nextActive = body.isActive;
    const roleChanged = nextRole !== undefined && nextRole !== user.role;
    const activeChanged = typeof nextActive === "boolean" && nextActive !== user.isActive;

    if (email === PROTECTED_ADMIN_EMAIL && (roleChanged || activeChanged)) {
      return NextResponse.json({ message: "This account cannot be changed" }, { status: 403 });
    }

    if (nextRole !== undefined && nextRole !== "USER" && nextRole !== "ADMIN") {
      return NextResponse.json({ message: "Role must be USER or ADMIN" }, { status: 400 });
    }

    const data: Prisma.UserUpdateInput = {};
    if (roleChanged && (nextRole === "USER" || nextRole === "ADMIN")) data.role = nextRole;
    if (activeChanged && typeof nextActive === "boolean") data.isActive = nextActive;

    const updated = Object.keys(data).length
      ? await prisma.user.update({ where: { email }, data })
      : user;

    if (roleChanged && (nextRole === "USER" || nextRole === "ADMIN")) {
      await writeAuditEvent({
        eventType: "USER_ROLE_CHANGED",
        actorEmail: currentUser.email,
        actorName: currentUser.name,
        targetEmail: email,
        ipAddress: getClientIp(req),
        metadata: { from: user.role, to: nextRole },
      });
    }

    if (activeChanged && typeof nextActive === "boolean") {
      await writeAuditEvent({
        eventType: nextActive ? "USER_ACTIVATED" : "USER_DEACTIVATED",
        actorEmail: currentUser.email,
        actorName: currentUser.name,
        targetEmail: email,
        ipAddress: getClientIp(req),
        metadata: { isActive: nextActive },
      });
    }

    return NextResponse.json({
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        isActive: updated.isActive,
      },
    });
  } catch (error) {
    console.error("[UPDATE_USER]", error);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
