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

    const result = await prisma.$transaction(async (tx) => {

      const offer = await tx.driverOffer.findUnique({
        where: { id: offerId },
        include: { job: true }
      })

      if (!offer) {
        throw new Error("Offer not found")
      }

      if (offer.driverId !== session.userId) {
        throw new Error("Offer does not belong to this driver")
      }

      if (offer.status !== "PENDING") {
        throw new Error("Offer not pending")
      }

      if (offer.expiresAt && offer.expiresAt <= new Date()) {
  throw new Error("Offer expired")
}


      const job = await tx.job.findUnique({
        where: { id: offer.jobId }
      })

      if (!job) throw new Error("Job not found")

      if (job.status !== "CREATED") {
        throw new Error("Job already assigned")
      }

      const assignment = await tx.jobAssignment.create({
        data: {
          jobId: job.id,
          userId: offer.driverId,
          status: "ACCEPTED"
        }
      })

      await tx.job.update({
        where: { id: job.id },
        data: {
          status: "ASSIGNED"
        }
      })

      await tx.user.update({
        where: { id: offer.driverId },
        data: {
          driverStatus: "BUSY"
        }
      })

      await tx.driverOffer.update({
        where: { id: offer.id },
        data: {
          status: "ACCEPTED",
          respondedAt: new Date()
        }
      })

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
