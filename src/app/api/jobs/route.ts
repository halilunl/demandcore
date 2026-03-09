import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireTenant } from "@/lib/tenant"
import { JobType } from "@prisma/client"

export async function POST(req: Request) {

  const tenantResult = await requireTenant(req)

  if (!tenantResult.ok) {
    return NextResponse.json(
      { error: tenantResult.error },
      { status: tenantResult.status }
    )
  }

  const body = await req.json()

  try {

    const job = await prisma.$transaction(async (tx) => {

      const job = await tx.job.create({
        data: {
          tenantId: tenantResult.tenant.id,
          type: JobType.SERVICE,
          title: body.title,
          description: body.description,
          status: "CREATED"
        }
      })

      await tx.jobLocation.create({
        data: {
          jobId: job.id,
          lat: body.lat ?? 0,
          lng: body.lng ?? 0
        }
      })

      await tx.jobEvent.create({
        data: {
          jobId: job.id,
          type: "JOB_CREATED"
        }
      })

      return job
    })

    return NextResponse.json(job)

  } catch (err: unknown) {

    console.error("JOB CREATE ERROR:", err)

    return NextResponse.json(
      { error: "Job create failed" },
      { status: 500 }
    )
  }
}
export async function GET(req: Request) {

  const tenantResult = await requireTenant(req)

  if (!tenantResult.ok) {
    return NextResponse.json(
      { error: tenantResult.error },
      { status: tenantResult.status }
    )
  }

  try {

    const jobs = await prisma.job.findMany({
      where: {
        tenantId: tenantResult.tenant.id
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json(jobs)

  } catch (err) {

    console.error("JOB LIST ERROR:", err)

    return NextResponse.json(
      { error: "Job list failed" },
      { status: 500 }
    )
  }
}