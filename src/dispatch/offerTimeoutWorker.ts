import { prisma } from "@/lib/prisma"
import { retryDispatch } from "./retryDispatch"

export async function checkOfferTimeouts() {

  const now = new Date()

  const expired = await prisma.driverOffer.findMany({
    where: {
      status: "PENDING",
      expiresAt: {
        lt: now
      }
    }
  })

  for (const offer of expired) {

    await prisma.driverOffer.update({
      where: { id: offer.id },
      data: { status: "EXPIRED" }
    })

    console.log(`Offer timeout: ${offer.id}`)

    await retryDispatch(offer.jobId)

  }

}
