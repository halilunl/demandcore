import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {

  const tenant = req.headers.get("x-tenant")

  if (!tenant) {
    return NextResponse.json(
      { error: "Tenant header required" },
      { status: 400 }
    )
  }

  const res = NextResponse.next()
  res.headers.set("x-tenant-id", tenant)

  return res
}

export const config = {
  matcher: ["/api/:path*"]
}