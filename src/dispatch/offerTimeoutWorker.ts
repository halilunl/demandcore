import { prisma } from "@/lib/prisma"
import { dispatchWorker } from "./dispatchWorker"


export async function offerTimeoutWorker() {
  
  //console.log("offer timeout worker running")

  const timeout = 10000 // 10 saniye

  const expiredOffers = await prisma.driverOffer.findMany({
    where: {
      status: "PENDING",
      createdAt: {
        lt: new Date(Date.now() - timeout)
      }
    }
  })

  for (const offer of expiredOffers) {

    await prisma.driverOffer.update({
      where: { id: offer.id },
      data: { status: "EXPIRED" }
    })

    await dispatchWorker(offer.jobId)

  }

}