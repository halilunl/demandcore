import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireTenant } from "@/lib/tenant"

export async function GET(req: Request) {

  const tenantResult = await requireTenant(req)

  if (!tenantResult.ok) {
    return NextResponse.json(
      { error: tenantResult.error },
      { status: tenantResult.status }
    )
  }

  try {

    const url = new URL(req.url)
    const id = url.pathname.split("/").pop()

    if (!id) {
      return NextResponse.json(
        { error: "Job id required" },
        { status: 400 }
      )
    }

    const job = await prisma.job.findFirst({
      where: {
        id: id,
        tenantId: tenantResult.tenant.id
      }
    })

    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(job)

  } catch (err) {

    console.error("JOB DETAIL ERROR:", err)

    return NextResponse.json(
      { error: "Job fetch failed" },
      { status: 500 }
    )
  }
}