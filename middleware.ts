import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/session-constants";

const PUBLIC_PATHS = ["/login"];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((path) => pathname === path);
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const hasSessionCookie = Boolean(
    request.cookies.get(SESSION_COOKIE_NAME)?.value,
  );

  if (!hasSessionCookie && !isPublicPath(pathname)) {
    const loginUrl = new URL("/login", request.url);
    const nextPath = pathname === "/" ? "/dashboard" : `${pathname}${search}`;
    loginUrl.searchParams.set("next", nextPath);
    return NextResponse.redirect(loginUrl);
  }

  if (hasSessionCookie && pathname === "/login") {
    const nextPath = request.nextUrl.searchParams.get("next") || "/dashboard";
    return NextResponse.redirect(new URL(nextPath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
