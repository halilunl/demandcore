import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {

  const body = await req.json()

  await prisma.user.update({
    where: { id: body.driverId },
    data: { driverStatus: "ONLINE" }
  })

  return NextResponse.json({ ok: true })

}