import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { OrderStatus, OrderSource } from "@prisma/client"
import { writeAuditLog } from "@/lib/audit"

const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  CREATED: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["ON_THE_WAY", "CANCELLED"],
  ON_THE_WAY: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
}

export async function PATCH(req: Request) {
  try {

    const pathname = new URL(req.url).pathname
    const id = pathname.split("/").slice(-2)[0]

    if (!id) {
      return NextResponse.json(
        { error: "Invalid order id" },
        { status: 400 }
      )
    }

    const url = new URL(req.url)

const tenantSlug =
  req.headers.get("x-tenant") ||
  url.searchParams.get("tenant")

if (!tenantSlug) {
  return NextResponse.json(
    { error: "Tenant header required" },
    { status: 401 }
  )
}

    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    })

    if (!tenant) {
      return NextResponse.json(
        { error: "Invalid tenant" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { status } = body as { status: OrderStatus }

    const order = await prisma.order.findUnique({
      where: { id },
    })

    if (!order || order.tenantId !== tenant.id) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    if (order.source !== OrderSource.INTERNAL) {
      return NextResponse.json(
        { error: "Marketplace orders cannot be modified" },
        { status: 403 }
      )
    }

    const allowed = allowedTransitions[order.status]

    if (!allowed.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status transition" },
        { status: 400 }
      )
    }

    const oldStatus = order.status

    const updated = await prisma.order.update({
      where: { id },
      data: { status },
    })

    await writeAuditLog({
      tenantId: order.tenantId,
      action: "STATUS_CHANGE",
      entity: "Order",
      entityId: order.id,
      oldValue: { status: oldStatus },
      newValue: { status: updated.status },
      req,
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