import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"

export async function POST(req: Request) {

  const session = await getSession()

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  const segments = new URL(req.url).pathname.split("/")
  const offerId = segments[segments.length - 2]

  try {

    const offer = await prisma.driverOffer.findUnique({
      where: { id: offerId }
    })

    if (!offer) {
      return NextResponse.json(
        { error: "Offer not found" },
        { status: 404 }
      )
    }

    if (offer.driverId !== session.userId) {
      return NextResponse.json(
        { error: "Offer does not belong to this driver" },
        { status: 403 }
      )
    }

    if (offer.status !== "PENDING") {
      return NextResponse.json(
        { error: "Offer not pending" },
        { status: 400 }
      )
    }

    await prisma.driverOffer.update({
      where: { id: offerId },
      data: {
        status: "REJECTED",
        respondedAt: new Date()
      }
    })

    return NextResponse.json({
      ok: true
    })

  } catch {

  return NextResponse.json(
    { error: "Reject failed" },
    { status: 500 }
  )

}

}
