import { NextRequest, NextResponse } from "next/server"
import { dispatchWorker } from "@/dispatch/dispatchWorker"

export async function GET(req: NextRequest) {

  const jobId = req.nextUrl.searchParams.get("jobId")

  if (!jobId) {
    return NextResponse.json(
      { error: "jobId required" },
      { status: 400 }
    )
  }

  await dispatchWorker(jobId)

  return NextResponse.json({
    ok: true
  })
}