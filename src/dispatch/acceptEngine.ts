import { prisma } from "@/lib/prisma"

export async function acceptEngine(offerId: string, driverId: string) {
  return await prisma.$transaction(async (tx) => {
    const offer = await tx.driverOffer.findUnique({
      where: { id: offerId },
      include: {
        job: true
      }
    })

    if (!offer) {
      throw new Error("Offer not found")
    }

    if (offer.driverId !== driverId) {
      throw new Error("Forbidden")
    }

    if (offer.status !== "PENDING") {
      throw new Error("Offer is not pending")
    }

    const now = new Date()

    if (offer.expiresAt && offer.expiresAt <= now) {
      throw new Error("Offer expired")
    }

    const existingAssignment = await tx.jobAssignment.findFirst({
      where: {
        jobId: offer.jobId
      }
    })

    if (existingAssignment) {
      throw new Error("Job already assigned")
    }

    await tx.driverOffer.update({
      where: { id: offer.id },
      data: {
        status: "ACCEPTED"
      }
    })

    await tx.driverOffer.updateMany({
      where: {
        jobId: offer.jobId,
        id: { not: offer.id },
        status: "PENDING"
      },
      data: {
        status: "REJECTED"
      }
    })

    const assignment = await tx.jobAssignment.create({
  data: {
    jobId: offer.jobId,
    userId: offer.driverId
  }
})

    const job = await tx.job.update({
      where: { id: offer.jobId },
      data: {
        status: "ASSIGNED"
      }
    })

    await tx.jobEvent.create({
      data: {
        jobId: offer.jobId,
        type: "JOB_ASSIGNED"
      }
    })

    return {
      ok: true,
      job,
      assignment
    }
  })
}