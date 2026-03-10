import { prisma } from "@/lib/prisma"

export async function broadcastOffers(jobId: string, drivers: { id: string }[]) {

  const offers = await prisma.driverOffer.createMany({
    data: drivers.map((d) => ({
      jobId,
      driverId: d.id
    }))
  })

  return offers
}