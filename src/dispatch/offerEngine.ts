import { prisma } from "@/lib/prisma"
import { scheduleOfferTimeout } from "./offerTimeout"

export async function broadcastOffers(jobId: string, drivers: { id: string }[]) {

  const createdOffers = []

  for (const driver of drivers) {

    const offer = await prisma.driverOffer.create({
      data: {
        jobId,
        driverId: driver.id,
        status: "PENDING"
      }
    })

    scheduleOfferTimeout(offer.id, jobId)

    createdOffers.push(offer)
  }

  return createdOffers
}