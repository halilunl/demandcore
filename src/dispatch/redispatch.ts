import { prisma } from "@/lib/prisma"
import { dispatchWorker } from "./dispatchWorker"

export async function redispatchJobs() {

  const jobs = await prisma.job.findMany({
    where: {
      status: "CREATED"
    },
    include: {
      assignments: true
    }
  })

  for (const job of jobs) {

    if (!job.assignments.length) {
      continue
    }

    const active = job.assignments.some(a =>
      a.status === "PENDING"
    )

    if (active) {
      continue
    }

    const accepted = job.assignments.some(a =>
      a.status === "ACCEPTED"
    )

    if (accepted) {
      continue
    }

    console.log(`Redispatch job ${job.id}`)

    await dispatchWorker(job.id)

  }

}