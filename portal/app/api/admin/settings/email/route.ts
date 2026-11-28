import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { encryptSecret } from "@/lib/server/email";

export const dynamic = "force-dynamic";

function forbidden() {
  return NextResponse.json({ message: "Forbidden - Admin access required" }, { status: 403 });
}

export async function GET() {
  try {
    const currentUser = await requireAdmin();
    if (!currentUser) return forbidden();

    const settings = await prisma.systemSetting.findFirst();
    if (!settings) {
      return NextResponse.json({
        smtpServer: "",
        smtpPort: null,
        smtpSecurity: "TLS",
        smtpUsername: "",
        smtpFromEmail: "",
        smtpPasswordSet: false,
      });
    }

    return NextResponse.json({
      smtpServer: settings.smtpServer ?? "",
      smtpPort: settings.smtpPort,
      smtpSecurity: settings.smtpSecurity ?? "TLS",
      smtpUsername: settings.smtpUsername ?? "",
      smtpFromEmail: settings.smtpFromEmail ?? "",
      smtpPasswordSet: Boolean(settings.smtpPassword),
    });
  } catch (error) {
    console.error("[GET_EMAIL_SETTINGS]", error);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const currentUser = await requireAdmin();
    if (!currentUser) return forbidden();

    const body = (await req.json()) as {
      smtpServer?: string;
      smtpPort?: number | string;
      smtpSecurity?: string;
      smtpUsername?: string;
      smtpPassword?: string;
      smtpFromEmail?: string;
    };

    const smtpServer = body.smtpServer?.trim();
    const smtpUsername = body.smtpUsername?.trim();
    const smtpFromEmail = body.smtpFromEmail?.trim();
    const smtpSecurity = body.smtpSecurity?.trim() || "TLS";
    const smtpPort = Number(body.smtpPort);
    const smtpPassword = body.smtpPassword?.trim() ?? "";

    if (!smtpServer || !smtpUsername || !smtpFromEmail || !Number.isInteger(smtpPort) || smtpPort < 1) {
      return NextResponse.json({ message: "Server, port, username, and from address are required" }, { status: 400 });
    }

    const existing = await prisma.systemSetting.findFirst();
    if (!smtpPassword && !existing?.smtpPassword) {
      return NextResponse.json({ message: "SMTP password is required" }, { status: 400 });
    }

    const storedPassword = smtpPassword ? encryptSecret(smtpPassword) : existing?.smtpPassword;
    const data = {
      smtpServer,
      smtpPort,
      smtpSecurity,
      smtpUsername,
      smtpFromEmail,
      smtpPassword: storedPassword,
    };

    if (existing) {
      await prisma.systemSetting.update({ where: { id: existing.id }, data });
    } else {
      await prisma.systemSetting.create({ data });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[POST_EMAIL_SETTINGS]", error);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
