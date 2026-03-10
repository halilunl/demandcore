import { prisma } from "@/lib/prisma"
import { findDrivers } from "./findDrivers"
import { broadcastOffers } from "./offerEngine"

export async function dispatchWorker(jobId: string) {

  // job'u al
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

  // daha önce teklif gönderilmiş driverlar
  const previousDrivers = job.assignments.map(a => a.userId)

  // uygun driverları bul
  const drivers = (await findDrivers(job))
  .filter(d => !previousDrivers.includes(d.userId))

await broadcastOffers(
  job.id,
  drivers.map(d => ({ id: d.userId }))
)

  if (!drivers.length) {
    console.log("dispatchWorker: no drivers found")
    return
  }

  // TOP3
  const topDrivers = drivers.slice(0, 3)

  let created = 0

  for (const driver of topDrivers) {

    // aynı job için aynı driver'a PENDING teklif var mı
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