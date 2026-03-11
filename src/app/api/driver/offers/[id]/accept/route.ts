import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {

  const offerId = req.url.split("/").slice(-2)[0]

  try {

    const result = await prisma.$transaction(async (tx) => {

      const offer = await tx.driverOffer.findUnique({
        where: { id: offerId },
        include: { job: true }
      })

      if (!offer) {
        throw new Error("Offer not found")
      }

      if (offer.status !== "PENDING") {
        throw new Error("Offer not pending")
      }

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
      // job status update
await tx.job.update({
  where: { id: job.id },
  data: {
    status: "ASSIGNED"
  }
})

// driver artık meşgul
await tx.user.update({
  where: { id: offer.driverId },
  data: { driverStatus: "BUSY" }
})


      // kabul edilen offer
      await tx.driverOffer.update({
        where: { id: offer.id },
        data: {
          status: "ACCEPTED",
          respondedAt: new Date()
        }
      })

      // diğer offerlar expire
      await tx.driverOffer.updateMany({
        where: {
          jobId: job.id,
          id: { not: offer.id }
        },
        data: { status: "EXPIRED" }
      })

      return assignment
    })

    return NextResponse.json({
      ok: true,
      assignmentId: result.id
    })

  } catch (err: unknown) {

  const message =
    err instanceof Error ? err.message : "Accept failed"

  return NextResponse.json(
    { error: message },
    { status: 400 }
  )

}

}