import { prisma } from "@/lib/prisma"
import { findDrivers } from "./findDrivers"
import { broadcastOffers } from "./offerEngine"
import { broadcastRealtimeOffer } from "./offerRealtime"

export async function dispatchWorker(jobId: string) {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      location: true,
      assignments: true
    }
  })

  if (!job) {
    console.log("dispatchWorker: job not found")
    return
  }

  const previousDrivers = job.assignments.map((a) => a.userId)

  const drivers = (await findDrivers(job)).filter(
    (d) => !previousDrivers.includes(d.userId)
  )

  if (!drivers.length) {
    console.log("dispatchWorker: no drivers found")
    return
  }

  await broadcastOffers(
    job.id,
    drivers.map((d) => ({ id: d.userId }))
  )
  await broadcastRealtimeOffer(
  job.id,
  drivers.map((d) => ({ id: d.userId }))
)

  const topDrivers = drivers.slice(0, 3)

  let created = 0

  for (const driver of topDrivers) {
    const existing = await prisma.jobAssignment.findFirst({
      where: {
        jobId: job.id,
        userId: driver.userId,
        status: "PENDING"
      }
    })

    if (existing) {
      continue
    }

    await prisma.jobAssignment.create({
      data: {
        jobId: job.id,
        userId: driver.userId,
        status: "PENDING"
      }
    })

    created++
  }

  console.log(`dispatchWorker: ${created} offers created`)
}