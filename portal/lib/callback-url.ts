export const PROTECTED_ADMIN_EMAIL = "admin@pss.edu.mh";

const APP_ROUTES = ["/dashboard", "/admin", "/login", "/logout"];

function nextAuthOrigin(nextAuthUrl: string): string {
  return new URL(nextAuthUrl).origin;
}

function portalHome(nextAuthUrl: string): string {
  return `${nextAuthUrl.replace(/\/$/, "")}/dashboard`;
}

function isSafeRelative(value: string): boolean {
  return value.startsWith("/") && !value.startsWith("//") && !value.includes("\\") && !value.includes("://");
}

function isAppPath(pathname: string): boolean {
  if (pathname === "/portal" || pathname.startsWith("/portal/")) return true;
  return APP_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

/**
 * Same-origin return target for the login page.
 * Editor paths stay on the site origin. Portal paths stay under NEXTAUTH_URL.
 * Anything else becomes the dashboard.
 */
export function resolveCallbackUrl(raw: string | null | undefined, nextAuthUrl: string): string {
  const fallback = portalHome(nextAuthUrl);
  const origin = nextAuthOrigin(nextAuthUrl);
  if (!raw?.trim()) return fallback;

  const value = raw.trim();
  let pathname = value;
  let suffix = "";

  if (value.includes("://")) {
    try {
      const url = new URL(value);
      if (url.origin !== origin) return fallback;
      pathname = url.pathname;
      suffix = `${url.search}${url.hash}`;
    } catch {
      return fallback;
    }
  } else if (!isSafeRelative(value)) {
    return fallback;
  } else {
    const hashIndex = value.indexOf("#");
    const queryIndex = value.indexOf("?");
    const cut = [queryIndex, hashIndex].filter((index) => index >= 0).sort((a, b) => a - b)[0];
    if (cut !== undefined) {
      pathname = value.slice(0, cut);
      suffix = value.slice(cut);
    }
  }

  if (!pathname.startsWith("/")) return fallback;

  if (pathname === "/portal" || pathname.startsWith("/portal/")) {
    return `${origin}${pathname}${suffix}`;
  }

  if (isAppPath(pathname)) {
    return `${nextAuthUrl.replace(/\/$/, "")}${pathname}${suffix}`;
  }

  return `${origin}${pathname}${suffix}`;
}
