import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

function getId(req: Request) {
  const pathname = new URL(req.url).pathname
  return pathname.split("/").pop()
}

export async function GET(req: Request) {
  try {

    const id = getId(req)

    if (!id) {
      return NextResponse.json(
        { error: "Missing order id" },
        { status: 400 }
      )
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: { createdAt: "asc" }
        }
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(order)

  } catch {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}