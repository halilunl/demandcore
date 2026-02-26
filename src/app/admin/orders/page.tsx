import { prisma } from "@/lib/prisma"
import FilterBar from "./_components/FilterBar"
import OrderListClient from "./_components/OrderListClient"
import { OrderStatus } from "@prisma/client"

export default async function OrdersPage({
  searchParams,
}: {
  searchParams?: { status?: string }
}) {

  const statusFilter = searchParams?.status

const validStatus = Object.values(OrderStatus).includes(
  statusFilter as OrderStatus
)
  ? (statusFilter as OrderStatus)
  : undefined

const orders = await prisma.order.findMany({
  where: validStatus
    ? { status: validStatus }
    : undefined,
  orderBy: { createdAt: "desc" },
})


  return (
    <main className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-6">
        Orders
      </h1>

      <FilterBar active={statusFilter} />

      <OrderListClient orders={orders} />
    </main>
  )
}