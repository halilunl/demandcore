import { prisma } from "@/lib/prisma"

export async function checkOfferTimeouts() {

  const timeoutSeconds = 10

  const expired = await prisma.jobAssignment.findMany({
    where: {
      status: "PENDING",
      createdAt: {
        lt: new Date(Date.now() - timeoutSeconds * 1000)
      }
    }
  })

  for (const offer of expired) {

    await prisma.jobAssignment.update({
      where: { id: offer.id },
      data: { status: "TIMEOUT" }
    })

    console.log(`Offer timeout: ${offer.id}`)
  }

}