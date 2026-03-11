import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized (no session)" },
        { status: 401 }
      )
    }

    const assignment = await prisma.jobAssignment.findFirst({
  where: {
    userId: session.userId,
    status: "ACCEPTED"
  },
  include: {
    job: {
      include: {
        location: true
      }
    }
  }
})

    if (!assignment) {
      return NextResponse.json({
        ok: true,
        job: null
      })
    }

    return NextResponse.json({
  ok: true,
  job: assignment?.job ?? null
})

  } catch (error) {
    console.error("driver active job error:", error)

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}