import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  AUTH_PATH,
  ROUTE_PREFIX,
  sanitizeRedirectPath,
  STORAGE_KEYS,
} from "@/lib/Constant";
import { canAccessAdminPanel } from "@/lib/config";

interface TokenPayload {
  role?: string;
  exp?: number;
}

/**
 * Best-effort read of the JWT claims for routing decisions only.
 * The signature is NOT verified here — never treat the result as an
 * authorization decision; the API re-validates every request.
 */
function decodeTokenPayload(token: string): TokenPayload | null {
  try {
    const segments = token.split(".");
    if (segments.length !== 3) return null;

    const base64 = segments[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const decoded: unknown = JSON.parse(atob(padded));

    if (!decoded || typeof decoded !== "object") return null;

    const { role, exp } = decoded as Record<string, unknown>;
    return {
      role: typeof role === "string" ? role : undefined,
      exp: typeof exp === "number" ? exp : undefined,
    };
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith(ROUTE_PREFIX.ADMIN);
  const isAuthRoute =
    pathname.startsWith(AUTH_PATH.LOGIN) || pathname.startsWith(AUTH_PATH.REGISTER);

  if (!isAdminRoute && !isAuthRoute) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get(STORAGE_KEYS.ACCESS_TOKEN)?.value
    ?? request.headers.get("authorization")?.replace("Bearer ", "");

  const tokenFromAuthCookie = request.cookies.get(STORAGE_KEYS.AUTH)?.value;

  const token = accessToken || tokenFromAuthCookie;
  const payload = token ? decodeTokenPayload(token) : null;
  const isAuthenticated = !!payload?.exp && payload.exp * 1000 > Date.now();
  const isAdmin = canAccessAdminPanel(payload?.role);

  if (isAdminRoute) {
    return NextResponse.next();
  }

  if (isAuthRoute && !isAuthenticated) {
    const rawRedirect = request.nextUrl.searchParams.get("redirect");
    const redirect = rawRedirect ? sanitizeRedirectPath(rawRedirect) : null;
    if (redirect && !redirect.startsWith(ROUTE_PREFIX.ADMIN)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  if (isAuthRoute && isAuthenticated) {
    if (isAdmin) {
      return NextResponse.redirect(new URL(`${ROUTE_PREFIX.ADMIN}/dashboard`, request.url));
    }
    // Store customers must not see admin login/register pages
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login", "/register"],
};
