import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function deny() {
  return new NextResponse(null, { status: 401 });
}

export async function GET() {
  try {
    const domain = process.env.ALLOWED_GOOGLE_DOMAIN?.trim().toLowerCase();
    if (!domain) return deny();

    const session = await getServerSession(authOptions);
    const email = session?.user?.email?.trim().toLowerCase();
    if (!email) return deny();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive || user.deletedAt) return deny();
    if (!user.email.toLowerCase().endsWith(`@${domain}`)) return deny();

    return new NextResponse(null, {
      status: 204,
      headers: {
        "X-PSS-User-Email": user.email,
        "X-PSS-User-Role": user.role,
      },
    });
  } catch (error) {
    console.error("[GATE]", error);
    return deny();
  }
}
