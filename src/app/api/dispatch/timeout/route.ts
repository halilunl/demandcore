import { NextResponse } from "next/server"
import { checkOfferTimeouts } from "@/dispatch/checkOfferTimeouts"

export async function GET() {

  await checkOfferTimeouts()

  return NextResponse.json({
    ok: true
  })

}