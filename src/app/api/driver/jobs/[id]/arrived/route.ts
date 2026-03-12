import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireTenant } from "@/lib/tenant"

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params

  const tenantResult = await requireTenant(req)

  if (!tenantResult.ok) {
    return NextResponse.json(
      { error: tenantResult.error },
      { status: tenantResult.status }
    )
  }

  const job = await prisma.job.findUnique({
    where: { id }
  })

  if (!job) {
    return NextResponse.json(
      { error: "Job not found" },
      { status: 404 }
    )
  }

  if (job.status !== "ON_THE_WAY") {
    return NextResponse.json(
      { error: "Job must be ON_THE_WAY" },
      { status: 400 }
    )
  }

  await prisma.job.update({
    where: { id },
    data: {
      status: "STARTED"
    }
  })

  await prisma.jobEvent.create({
    data: {
      jobId: id,
      type: "SERVICE_STARTED"
    }
  })

  return NextResponse.json({ ok: true })
}