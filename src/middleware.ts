import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/api/auth/login",
  "/api/health",
  "/api/debug",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only protect API routes
  if (!pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Public endpoints
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Tenant header required
  const tenant = req.headers.get("x-tenant");
  if (!tenant) {
    return NextResponse.json(
      { error: "Tenant header required" },
      { status: 400 }
    );
  }

  // Session cookie required
  const hasSession = req.cookies.get("dc_session");

  if (!hasSession) {
    return NextResponse.json(
      { error: "Unauthorized (no session)" },
      { status: 401 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};