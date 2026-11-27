import NextAuth from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getClientIdentifier, rateLimit } from "@/lib/rate-limit";
import { runWithRequest } from "@/lib/request-context";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many authentication attempts. Please try again later.",
});

const SKIP_RATE_LIMIT_PATHS = new Set(["session", "providers", "csrf"]);

function shouldRateLimit(params: { nextauth?: string[] }): boolean {
  return !(params.nextauth?.[0] && SKIP_RATE_LIMIT_PATHS.has(params.nextauth[0]));
}

function rateLimitedResponse(rateLimitResult: {
  success: boolean;
  message?: string;
  remaining?: number;
  resetTime?: number;
}) {
  return NextResponse.json(
    { error: rateLimitResult.message },
    {
      status: 429,
      headers: {
        "X-RateLimit-Limit": "100",
        "X-RateLimit-Remaining": String(rateLimitResult.remaining || 0),
        "X-RateLimit-Reset": String(rateLimitResult.resetTime || Date.now()),
      },
    },
  );
}

const handler = NextAuth(authOptions);

async function resolveParams(
  params: Promise<{ nextauth: string[] }> | { nextauth: string[] },
): Promise<{ nextauth: string[] }> {
  return params instanceof Promise ? await params : params;
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ nextauth: string[] }> | { nextauth: string[] } },
) {
  try {
    const resolvedParams = await resolveParams(context.params);
    if (shouldRateLimit(resolvedParams)) {
      const rateLimitResult = authLimiter(getClientIdentifier(req));
      if (!rateLimitResult.success) return rateLimitedResponse(rateLimitResult);
    }
    return await runWithRequest(req, () => handler(req, { params: resolvedParams }));
  } catch (error) {
    console.error("[AUTH_GET]", error);
    return NextResponse.json({ error: "Authentication error occurred" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ nextauth: string[] }> | { nextauth: string[] } },
) {
  try {
    const resolvedParams = await resolveParams(context.params);
    const rateLimitResult = authLimiter(getClientIdentifier(req));
    if (!rateLimitResult.success) return rateLimitedResponse(rateLimitResult);
    return await runWithRequest(req, () => handler(req, { params: resolvedParams }));
  } catch (error) {
    console.error("[AUTH_POST]", error);
    return NextResponse.json({ error: "Authentication error occurred" }, { status: 500 });
  }
}
