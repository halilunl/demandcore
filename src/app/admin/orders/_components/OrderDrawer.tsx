"use client"
/// <reference lib="dom" />
import { useEffect, useState } from "react"
import { Order, OrderItem, OrderStatus } from "@prisma/client"

type FullOrder = Order & {
  items: OrderItem[]
}

type Props = {
  order: Order | null
  onClose: () => void
  onStatusChange?: (id: string, status: OrderStatus) => void
}

const TENANT = "a"


export default function OrderDrawer({
  order,
  onClose,
  onStatusChange,
}: Props) {

  const [fullOrder, setFullOrder] = useState<FullOrder | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    setFullOrder(null)
  }, [order?.id])

  useEffect(() => {
    if (!order) return

    const load = async () => {
      setLoading(true)

      const res = await fetch(
  `/admin/orders/${order.id}`,
  {
    credentials: "include",
    headers: {
      "x-tenant": TENANT
    }
  }
)

      if (!res.ok) {
        console.error("Order fetch failed")
        setLoading(false)
        return
      }

      const data = await res.json()
setFullOrder(data.order ?? data)
setLoading(false)}

    load()
  }, [order])

  const calculatedTotal =
    fullOrder?.items?.reduce(
      (acc, item) => acc + (item.lineTotal ?? 0),
      0
    ) ?? 0

    const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  CREATED: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["ON_THE_WAY", "CANCELLED"],
  ON_THE_WAY: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
}

  const updateStatus = async (newStatus: OrderStatus) => {
    if (!fullOrder) return

    const previousStatus = fullOrder.status

    // Optimistic update
    setFullOrder(prev =>
      prev ? { ...prev, status: newStatus } : prev
    )

    try {
      const res = await fetch("/api/orders/" + fullOrder.id + "/status?tenant=a", {
  method: "PATCH",
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
    "x-tenant": "a"
  },
  body: JSON.stringify({ status: newStatus }),
})

      if (!res.ok) throw new Error("Update failed")

      // Parent listeyi güncelle
      onStatusChange?.(fullOrder.id, newStatus)

      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)

    } catch (err) {

      // Geri al
      setFullOrder(prev =>
        prev ? { ...prev, status: previousStatus } : prev
      )

      console.error("Status update failed", err)
    }
  }

  if (!order) return null

  return (
    <div className="fixed inset-0 z-50 flex">

      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      <div className="relative ml-auto w-full max-w-md bg-white shadow-xl p-6 overflow-y-auto">

        <button
          onClick={onClose}
          className="mb-4 text-sm text-gray-500 hover:text-black transition"
        >
          Kapat
        </button>

        <h2 className="text-xl font-bold mb-4">
          Sipariş Detayı
        </h2>

        {loading && (
          <div className="text-sm text-gray-400">
            Yükleniyor...
          </div>
        )}

        {fullOrder && (
          <>
            {success && (
              <div className="mb-4 text-xs font-semibold text-green-700 bg-green-100 px-3 py-2 rounded-lg">
                Durum güncellendi
              </div>
            )}

            <div className="mb-6">
              <h3 className="font-semibold mb-2">
                Ürünler
              </h3>

              {fullOrder.items?.length ? (
                <div className="space-y-2">
                  {fullOrder.items.map(item => (
                    <div
                      key={item.id}
                      className="flex justify-between text-sm border-b pb-1"
                    >
                      <div>
                        {item.name}
                        <span className="text-gray-400 ml-2">
                          x{item.quantity}
                        </span>
                      </div>

                      <div>
                        {(item.lineTotal / 100).toFixed(2)} ₺
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-400">
                  Ürün bulunamadı
                </div>
              )}
            </div>

            <div className="mb-6 font-semibold">
              Toplam: {(calculatedTotal / 100).toFixed(2)} ₺
            </div>

            {fullOrder.source === "INTERNAL" && (
              <select
  className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
  value={fullOrder.status}
  onChange={(e) =>
    updateStatus(e.target.value as OrderStatus)
  }
>
  <option value={fullOrder.status}>
    {fullOrder.status}
  </option>

  {allowedTransitions[fullOrder.status].map(status => (
    <option key={status} value={status}>
      {status}
    </option>
  ))}
</select>
            )}
          </>
        )}

      </div>
    </div>
  )
}