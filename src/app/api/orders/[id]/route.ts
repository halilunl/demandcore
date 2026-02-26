import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

function getId(req: Request) {
  const pathname = new URL(req.url).pathname
  return pathname.split("/").pop()
}

export async function GET(req: Request) {

  const id = getId(req)
  if (!id) return NextResponse.json({ error: "Geçersiz id" }, { status: 400 })

  const order = await prisma.order.findFirst({
    where: { id },
    include: { items: true, events: true },
  })

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })

  return NextResponse.json({ order })
}