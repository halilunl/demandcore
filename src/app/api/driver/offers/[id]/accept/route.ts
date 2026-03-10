import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {

  const offerId = req.url.split("/").slice(-2)[0]

  const offer = await prisma.driverOffer.findUnique({
    where: { id: offerId },
    include: { job: true }
  })

  if (!offer) {
    return NextResponse.json({ error: "Offer not found" }, { status: 404 })
  }

  if (offer.status !== "PENDING") {
    return NextResponse.json({ error: "Offer not pending" }, { status: 400 })
  }

  const result = await prisma.$transaction(async (tx) => {

    const job = await tx.job.findUnique({
      where: { id: offer.jobId }
    })

    if (!job) throw new Error("Job not found")

    if (job.status !== "CREATED") {
      throw new Error("Job already assigned")
    }

    // assignment oluştur
    const assignment = await tx.jobAssignment.create({
      data: {
        jobId: job.id,
        userId: offer.driverId,
        status: "ACCEPTED"
      }
    })

    // job status update
    await tx.job.update({
      where: { id: job.id },
      data: {
        status: "ASSIGNED"
      }
    })

    // kabul edilen offer
    await tx.driverOffer.update({
      where: { id: offer.id },
      data: { status: "ACCEPTED" }
    })

    // diğer offerlar expire
    await tx.driverOffer.updateMany({
      where: {
        jobId: job.id,
        id: { not: offer.id }
      },
      data: {
        status: "EXPIRED"
      }
    })

    return assignment
  })

  return NextResponse.json({
    ok: true,
    assignmentId: result.id
  })
}