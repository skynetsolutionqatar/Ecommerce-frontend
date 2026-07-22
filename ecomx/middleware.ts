import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  AUTH_PATH,
  isAdminRole,
  ROUTE_PREFIX,
  STORAGE_KEYS,
} from "@/lib/Constant";

function decodeTokenPayload(token: string): { role?: string; exp?: number } | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return decoded;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith(ROUTE_PREFIX.ADMIN);
  const isAuthRoute =
    pathname.startsWith(AUTH_PATH.LOGIN) || pathname.startsWith(AUTH_PATH.REGISTER);

  if (!isAdminRoute && !isAuthRoute) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get(STORAGE_KEYS.ACCESS_TOKEN)?.value
    ?? request.headers.get("authorization")?.replace("Bearer ", "");

  const tokenFromHeader = request.cookies.get(STORAGE_KEYS.AUTH)?.value;

  const token = accessToken || tokenFromHeader;
  const payload = token ? decodeTokenPayload(token) : null;
  const isAuthenticated = !!payload?.exp && payload.exp * 1000 > Date.now();
  const isAdmin = isAdminRole(payload?.role);

  if (isAdminRoute) {
    return NextResponse.next();
  }

  if (isAuthRoute && isAuthenticated && isAdmin) {
    return NextResponse.redirect(new URL(`${ROUTE_PREFIX.ADMIN}/dashboard`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login", "/register"],
};
