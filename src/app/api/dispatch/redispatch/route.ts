import { NextResponse } from "next/server"
import { redispatchJobs } from "@/dispatch/redispatch"

export async function GET() {

  await redispatchJobs()

  return NextResponse.json({
    ok: true
  })

}