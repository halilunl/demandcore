import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {

  try {

    // şimdilik test için query'den alacağız
    const url = new URL(req.url)
    const driverId = url.searchParams.get("driverId")

    if (!driverId) {
      return NextResponse.json(
        { error: "driverId required" },
        { status: 400 }
      )
    }

    const offers = await prisma.jobAssignment.findMany({
      where: {
        userId: driverId,
        status: "PENDING"
      },
      include: {
        job: {
          include: {
            location: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json({
      offers
    })

  } catch (err) {

    const message =
      err instanceof Error ? err.message : "UNKNOWN_ERROR"

    return NextResponse.json(
      { error: message },
      { status: 500 }
    )

  }

}