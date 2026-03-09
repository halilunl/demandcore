import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // dispatch worker bypass
  if (pathname.startsWith("/api/dispatch")) {
    return NextResponse.next();
  }

  const tenant = req.headers.get("x-tenant");

  if (!tenant) {
    return NextResponse.json(
      { error: "Tenant header required" },
      { status: 400 }
    );
  }

  const session = req.cookies.get("dc_session");

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized (no session)" },
      { status: 401 }
    );
  }

  return NextResponse.next();
}