import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { getAdminStats } from "@/lib/server/admin-stats";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ message: "Forbidden - Admin access required" }, { status: 403 });
    }
    return NextResponse.json(await getAdminStats());
  } catch (error) {
    console.error("[ADMIN_STATS]", error);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
