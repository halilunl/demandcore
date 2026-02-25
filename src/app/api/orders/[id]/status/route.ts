import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { OrderStatus } from "@prisma/client"
import { requireTenant } from "@/lib/tenant"

function getId(req: Request) {
  const pathname = new URL(req.url).pathname
  // .../orders/:id/status -> pop() = "status" olacağı için sondan ikinciyi alıyoruz
  const parts = pathname.split("/")
  return parts[parts.length - 2]
}

const allowed: Record<OrderStatus, OrderStatus[]> = {
  CREATED: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["ON_THE_WAY", "CANCELLED"],
  ON_THE_WAY: ["DELIVERED", "CANCELLED"],
  DELIVERED: [],
  CANCELLED: [],
}

export async function PATCH(req: Request) {
  const tenantResult = await requireTenant(req)

if (!tenantResult.ok) {
  return NextResponse.json(
    { error: tenantResult.error },
    { status: tenantResult.status }
  )
}

const tenant = tenantResult.tenant

  const id = getId(req)
  if (!id) return NextResponse.json({ error: "Geçersiz id" }, { status: 400 })

  const body = (await req.json()) as { status?: OrderStatus }
  const next = body?.status
  if (!next) return NextResponse.json({ error: "status zorunlu" }, { status: 400 })

  const current = await prisma.order.findFirst({
    where: { id, tenantId: tenant.id },
    select: { id: true, status: true },
  })

  if (!current) return NextResponse.json({ error: "Order not found" }, { status: 404 })

  const ok = allowed[current.status].includes(next)
  if (!ok) {
    return NextResponse.json(
      { error: `Illegal transition: ${current.status} -> ${next}` },
      { status: 400 }
    )
  }

  const readyAt = next === "ON_THE_WAY" ? new Date() : undefined

  const updated = await prisma.order.update({
    where: { id },
    data: {
      status: next,
      ...(readyAt ? { readyAt } : {}),
      events: {
        create: {
          type: "STATUS_CHANGED",
          provider: "INTERNAL",
          payload: { from: current.status, to: next },
        },
      },
    },
    include: { items: true },
  })

  return NextResponse.json({ order: updated })
}