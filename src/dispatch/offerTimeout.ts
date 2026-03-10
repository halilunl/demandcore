import { prisma } from "@/lib/prisma"
import { dispatchWorker } from "./dispatchWorker"

export async function scheduleOfferTimeout(offerId: string, jobId: string) {

  setTimeout(async () => {

    const offer = await prisma.driverOffer.findUnique({
      where: { id: offerId }
    })

    if (!offer) return
    if (offer.status !== "PENDING") return

    await prisma.driverOffer.update({
      where: { id: offerId },
      data: { status: "EXPIRED" }
    })

    await dispatchWorker(jobId)

  }, 10000)

}