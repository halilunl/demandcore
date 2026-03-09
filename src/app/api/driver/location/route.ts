import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)

  const userId = body?.userId?.toString()
  const lat = Number(body?.lat)
  const lng = Number(body?.lng)

  if (!userId || Number.isNaN(lat) || Number.isNaN(lng)) {
    return NextResponse.json(
      { error: "userId/lat/lng required" },
      { status: 400 }
    )
  }

  const location = await prisma.driverLocation.upsert({
    where: { userId },
    update: {
      lat,
      lng,
    },
    create: {
      userId,
      lat,
      lng,
    }
  })

  return NextResponse.json({
    ok: true,
    location
  })
}