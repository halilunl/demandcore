import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"


export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const assignmentId = id

  try {

    const result = await prisma.$transaction(async (tx) => {

      const assignment = await tx.jobAssignment.findUnique({
        where: { id: assignmentId },
        include: { job: true }
      })

      if (!assignment) {
        throw new Error("ASSIGNMENT_NOT_FOUND")
      }

      if (assignment.status !== "PENDING") {
        throw new Error("ASSIGNMENT_NOT_AVAILABLE")
      }

      const job = assignment.job

      if (job.status !== "CREATED") {
        throw new Error("JOB_ALREADY_ASSIGNED")
      }

      // ACCEPT
      await tx.jobAssignment.update({
        where: { id: assignmentId },
        data: { status: "ACCEPTED" }
      })

      // Job assign
      await tx.job.update({
        where: { id: job.id },
        data: {
          status: "ASSIGNED",
          assignedDriverId: assignment.userId
        }
      })

      // diğer teklifleri iptal et
      await tx.jobAssignment.updateMany({
        where: {
          jobId: job.id,
          id: { not: assignmentId }
        },
        data: {
          status: "REJECTED"
        }
      })

      return { success: true }

    })

    return NextResponse.json(result)

  } catch (err) {

  const message =
    err instanceof Error ? err.message : "UNKNOWN_ERROR"

  return NextResponse.json(
    { error: message },
    { status: 400 }
  )

}

   }