import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized (no session)" },
        { status: 401 }
      )
    }

    const now = new Date()

    const offers = await prisma.driverOffer.findMany({
      where: {
        driverId: session.userId,
        status: "PENDING",
        expiresAt: {
          gt: now
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      include: {
        job: {
          include: {
            location: true
          }
        }
      }
    })

    return NextResponse.json({
      ok: true,
      items: offers
    })
  } catch (error) {
    console.error("driver offers error:", error)

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}