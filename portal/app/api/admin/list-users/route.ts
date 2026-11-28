import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const currentUser = await requireAdmin();
    if (!currentUser) {
      return NextResponse.json({ message: "Forbidden - Admin access required" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      where: { deletedAt: null },
      orderBy: { email: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("[LIST_USERS]", error);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
