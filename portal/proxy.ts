import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export default async function proxy(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = req.nextUrl;
  const isPublicPath =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/admin" ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico" ||
    pathname === "/favicon.png" ||
    pathname === "/pss-logo.png";

  if (isPublicPath) {
    return NextResponse.next();
  }

  if (!token) {
    const login = req.nextUrl.clone();
    const callback = `${req.nextUrl.basePath}${pathname}`;
    login.pathname = "/login";
    login.search = `?callbackUrl=${encodeURIComponent(callback)}`;
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|favicon.png|pss-logo.png).*)"],
};
