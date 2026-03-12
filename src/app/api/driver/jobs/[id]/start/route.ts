import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireTenant } from "@/lib/tenant"

export async function POST(req: Request) {

  const tenantResult = await requireTenant(req)

  if (!tenantResult.ok) {
    return NextResponse.json({ error: tenantResult.error }, { status: 401 })
  }

  const url = new URL(req.url)
  const jobId = url.pathname.split("/").pop()

  if (!jobId) {
    return NextResponse.json({ error: "jobId required" }, { status: 400 })
  }

  const job = await prisma.job.findUnique({
    where: { id: jobId }
  })

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 })
  }

  if (job.status !== "ASSIGNED") {
    return NextResponse.json({ error: "Job must be ASSIGNED first" }, { status: 400 })
  }

  await prisma.job.update({
    where: { id: jobId },
    data: { status: "ON_THE_WAY" }
  })

  await prisma.jobEvent.create({
    data: {
      jobId,
      type: "JOB_STARTED"
    }
  })

  return NextResponse.json({
    ok: true,
    status: "ON_THE_WAY"
  })
}