import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {

  const { id } = await params

  const session = await getSession()

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized (no session)" },
      { status: 401 }
    )
  }

  const body = await req.json()
  const { status } = body

  const allowed = ["EN_ROUTE","ARRIVED","STARTED","COMPLETED"]

  if (!allowed.includes(status)) {
    return NextResponse.json(
      { error: "Invalid status" },
      { status: 400 }
    )
  }

  const assignment = await prisma.jobAssignment.findFirst({
    where: {
      jobId: id,
      userId: session.userId,
      status: "ACCEPTED"
    }
  })

  if (!assignment) {
    return NextResponse.json(
      { error: "Assignment not found" },
      { status: 404 }
    )
  }

  const job = await prisma.job.update({
    where: { id },
    data: { status }
  })

  return NextResponse.json({
    ok: true,
    job
  })

}