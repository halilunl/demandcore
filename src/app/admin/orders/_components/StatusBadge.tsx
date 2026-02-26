// app/admin/orders/_components/StatusBadge.tsx

import { OrderStatus } from "@prisma/client"

export default function StatusBadge({
  status,
}: {
  status: OrderStatus
}) {

  const map: Record<OrderStatus, string> = {
    CREATED: "bg-red-100 text-red-600",
    CONFIRMED: "bg-purple-100 text-purple-700",
    PREPARING: "bg-yellow-100 text-yellow-700",
    ON_THE_WAY: "bg-blue-100 text-blue-600",
    DELIVERED: "bg-green-100 text-green-700",
    CANCELLED: "bg-gray-200 text-gray-600",
  }

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${map[status]}`}>
      {status}
    </span>
  )
}