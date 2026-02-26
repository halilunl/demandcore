import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { OrderStatus } from "@prisma/client"

function getId(req: Request) {
  const pathname = new URL(req.url).pathname
  return pathname.split("/").slice(-2)[0]
}

export async function PATCH(req: Request) {
  try {
    const id = getId(req)

    if (!id) {
      return NextResponse.json(
        { error: "Missing order id" },
        { status: 400 }
      )
    }

    const body = await req.json()
    const { status } = body as { status: OrderStatus }

    const order = await prisma.order.findUnique({
      where: { id },
    })

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    if (order.source !== "INTERNAL") {
      return NextResponse.json(
        { error: "Marketplace orders cannot be modified" },
        { status: 403 }
      )
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json(updated)

  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}