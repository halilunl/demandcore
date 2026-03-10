import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {

  const { id } = await context.params
  const offerId = id

  const offer = await prisma.driverOffer.findUnique({
    where: { id: offerId }
  })

  if (!offer) {
    return NextResponse.json(
      { error: "Offer not found" },
      { status: 404 }
    )
  }

  if (offer.status !== "PENDING") {
    return NextResponse.json(
      { error: "Offer already handled" },
      { status: 400 }
    )
  }

  const result = await prisma.$transaction(async (tx) => {

    const assignment = await tx.jobAssignment.create({
      data: {
        jobId: offer.jobId,
        userId: offer.driverId,
        status: "ACCEPTED"
      }
    })

    await tx.driverOffer.update({
      where: { id: offerId },
      data: { status: "ACCEPTED" }
    })

    await tx.driverOffer.updateMany({
      where: {
        jobId: offer.jobId,
        id: { not: offerId }
      },
      data: { status: "REJECTED" }
    })

    await tx.job.update({
      where: { id: offer.jobId },
      data: { status: "ASSIGNED" }
    })

    return assignment
  })

  return NextResponse.json({
    ok: true,
    assignment: result
  })
}