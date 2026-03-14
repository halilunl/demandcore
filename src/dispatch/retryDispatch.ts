import { prisma } from "@/lib/prisma"
import { findDrivers } from "./findDrivers"
import { broadcastOffers } from "./offerEngine"

export async function retryDispatch(jobId: string) {

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      location: true,
      assignments: true
    }
  })

  if (!job) {
    console.log("retryDispatch: job not found")
    return
  }

  // job zaten alınmışsa retry yapma
  if (job.status !== "CREATED") {
    console.log("retryDispatch: job already assigned")
    return
  }

  // 🔴 CRITICAL: aktif pending offer varsa yeni dispatch yapma
  const activePendingOffers = await prisma.driverOffer.count({
    where: {
      jobId,
      status: "PENDING",
      expiresAt: {
        gt: new Date()
      }
    }
  })

  if (activePendingOffers > 0) {
    console.log("retryDispatch: active pending offers already exist")
    return
  }

  // daha önce offer gönderilen driverlar
  const previousOffers = await prisma.driverOffer.findMany({
    where: { jobId },
    select: { driverId: true }
  })

  const excludedDriverIds = previousOffers.map(o => o.driverId)

  const drivers = await findDrivers(job)

  const freshDrivers = drivers.filter(
    d => !excludedDriverIds.includes(d.userId)
  )

  if (!freshDrivers.length) {
    console.log("retryDispatch: no new drivers found")
    return
  }

  await broadcastOffers(
    job.id,
    freshDrivers.map(d => ({ id: d.userId }))
  )

  console.log(`retryDispatch: ${freshDrivers.length} new offers broadcast`)
}
