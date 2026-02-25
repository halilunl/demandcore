import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireTenant } from "@/lib/tenant"

function getId(req: Request) {
  const pathname = new URL(req.url).pathname
  const parts = pathname.split("/")
  return parts[parts.length - 2]
}

export async function GET(req: Request) {
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

  const order = await prisma.order.findFirst({
    where: { id, tenantId: tenant.id },
    select: { id: true },
  })
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })

  const events = await prisma.orderEvent.findMany({
    where: { orderId: id },
    orderBy: { createdAt: "desc" },
    take: 200,
  })

  return NextResponse.json({ events })
}