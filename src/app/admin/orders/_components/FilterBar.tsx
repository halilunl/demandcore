"use client"

import { useRouter } from "next/navigation"
import { OrderStatus } from "@prisma/client"

const statuses: (OrderStatus | "ALL")[] = [
  "ALL",
  "CREATED",
  "CONFIRMED",
  "PREPARING",
  "ON_THE_WAY",
  "DELIVERED",
  "CANCELLED",
]

export default function FilterBar({ active }: { active?: string }) {

  const router = useRouter()

  const setFilter = (status: string) => {

    if (status === "ALL") {
      router.push("/admin/orders")
      return
    }

    router.push(`/admin/orders?status=${status}`)
  }

  return (
    <div className="flex flex-wrap gap-2 mb-8">

      {statuses.map(status => {

        const isActive =
          (status === "ALL" && !active) ||
          status === active

        return (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-full text-sm transition ${
              isActive
                ? "bg-black text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {status}
          </button>
        )
      })}

    </div>
  )
}