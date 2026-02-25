import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { OrderSource, OrderStatus } from "@prisma/client"
import { requireTenant } from "@/lib/tenant"
import { Prisma } from "@prisma/client"

export async function GET(req: Request) {
  const tenantResult = await requireTenant(req)

if (!tenantResult.ok) {
  return NextResponse.json(
    { error: tenantResult.error },
    { status: tenantResult.status }
  )
}

const tenant = tenantResult.tenant

  const url = new URL(req.url)
  const status = url.searchParams.get("status") as OrderStatus | null
  const take = Math.min(Number(url.searchParams.get("take") ?? 50), 200)

  const orders = await prisma.order.findMany({
    where: {
      tenantId: tenant.id,
      ...(status ? { status } : {}),
    },
    orderBy: { createdAt: "desc" },
    take,
    include: { items: true },
  })

  return NextResponse.json({ orders })
}

type CreateOrderBody = {
  source?: OrderSource
  externalCode?: string
  customerName?: string
  customerPhone?: string
  addressLine?: string
  addressNote?: string
  items: Array<{
    productId?: string
    name: string
    unitPrice: number
    quantity: number
  }>
 meta?: Prisma.InputJsonValue
}

export async function POST(req: Request) {
  const tenantResult = await requireTenant(req)

if (!tenantResult.ok) {
  return NextResponse.json(
    { error: tenantResult.error },
    { status: tenantResult.status }
  )
}

const tenant = tenantResult.tenant

  const body = (await req.json()) as CreateOrderBody
  if (!body?.items?.length) {
    return NextResponse.json({ error: "items zorunlu" }, { status: 400 })
  }

  const items = body.items.map((it) => {
    const qty = Number(it.quantity)
    const price = Number(it.unitPrice)
    if (!it.name || qty <= 0 || price < 0) {
      throw new Error("Geçersiz item")
    }
    return {
      productId: it.productId ?? null,
      name: it.name,
      unitPrice: price,
      quantity: qty,
      lineTotal: price * qty,
    }
  })

  const subtotal = items.reduce((a, b) => a + b.lineTotal, 0)
  const total = subtotal

  const order = await prisma.order.create({
    data: {
      tenantId: tenant.id,
      source: body.source ?? OrderSource.INTERNAL,
      externalCode: body.externalCode ?? null,
      status: OrderStatus.CREATED,

      subtotal,
      total,

      customerName: body.customerName ?? null,
      customerPhone: body.customerPhone ?? null,
      addressLine: body.addressLine ?? null,
      addressNote: body.addressNote ?? null,

      meta: body.meta ?? undefined,

      items: { create: items },
      events: {
        create: {
          type: "ORDER_CREATED",
          provider: body.source ?? "INTERNAL",
          payload: { subtotal, total },
        },
      },
    },
    include: { items: true },
  })

  return NextResponse.json({ order }, { status: 201 })
}