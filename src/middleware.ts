import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // API dışı yolları geç
  if (!pathname.startsWith("/api")) {
    return NextResponse.next()
  }

  // Serbest endpointler
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/health") ||
    pathname.startsWith("/api/debug")
  ) {
    return NextResponse.next()
  }

  // Tenant zorunlu
  const tenant = req.headers.get("x-tenant")
  if (!tenant) {
    return NextResponse.json(
      { error: "Tenant required" },
      { status: 400 }
    )
  }

  // Session zorunlu
  const session = req.cookies.get("dc_session")
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  return NextResponse.next()
}