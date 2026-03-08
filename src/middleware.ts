import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // API dışı yolları geç
  if (!pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Auth endpointleri serbest
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Tenant header kontrolü
  const tenant = req.headers.get("x-tenant");
  if (!tenant) {
    return NextResponse.json(
      { error: "Tenant header required" },
      { status: 400 }
    );
  }

  // Session cookie kontrolü
  const session = req.cookies.get("dc_session");
  if (!session) {
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