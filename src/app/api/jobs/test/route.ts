import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { dispatchWorker } from "@/dispatch/dispatchWorker"
import { JobType } from "@prisma/client"

export async function GET(req: Request) {

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const url = new URL(req.url)
  const tenantId = "a"

  const job = await prisma.job.create({
    data: {
      tenantId,
      type: JobType.SERVICE,
      title: "Realtime Test Job",
      description: "dispatch test",
      status: "CREATED"
    }
  })

  await prisma.jobLocation.create({
    data: {
      jobId: job.id,
      lat: 41.01,
      lng: 28.97
    }
  })

  await dispatchWorker(job.id)

  return NextResponse.json({
    ok: true,
    jobId: job.id
  })
}