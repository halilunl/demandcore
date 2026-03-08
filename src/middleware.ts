import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const tenant =
    req.headers.get("x-tenant") ||
    req.nextUrl.searchParams.get("tenant");

  if (!tenant) {
    return NextResponse.json(
      { error: "Tenant required" },
      { status: 400 }
    );
  }

  const session = req.cookies.get("dc_session");

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};