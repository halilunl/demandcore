"use client"

import { useState, useEffect } from "react"
import { Order } from "@prisma/client"
import StatusBadge from "./StatusBadge"
import OrderDrawer from "./OrderDrawer"
import { formatPrice } from "@/lib/utils"

export default function OrderListClient({
  orders,
}: {
  orders: Order[]
}) {

  const [localOrders, setLocalOrders] = useState<Order[]>(orders)
  const [selected, setSelected] = useState<Order | null>(null)

  // Server’dan yeni orders gelirse senkronla
  useEffect(() => {
    setLocalOrders(orders)
  }, [orders])

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

        {localOrders.map(order => (
          <div
            key={order.id}
            onClick={() => setSelected(order)}
            className="cursor-pointer bg-white border rounded-2xl p-6 shadow-sm hover:shadow-lg transition"
          >
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold">
                #{order.id.slice(-6)}
              </span>

              <StatusBadge status={order.status} />
            </div>

            <div className="text-lg font-medium">
              {order.customerName}
            </div>

            <div className="text-gray-500 mt-1">
              {formatPrice(order.total)} ₺
            </div>

            <div className="mt-6 flex justify-between text-sm text-gray-400">
              <span>{order.source}</span>
              <span>{new Date(order.createdAt).toLocaleString()}</span>
            </div>
          </div>
        ))}

      </div>

      <OrderDrawer
        order={selected}
        onClose={() => setSelected(null)}
        onStatusChange={(id, newStatus) => {
          setLocalOrders(prev =>
            prev.map(o =>
              o.id === id ? { ...o, status: newStatus } : o
            )
          )
        }}
      />
    </>
  )
}