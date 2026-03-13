import { realtimeBus } from "@/lib/realtime/bus"
import { RealtimeEvent } from "@/lib/realtime/events"
import { requireTenant } from "@/lib/tenant"
import { registerDriver, unregisterDriver } from "@/realtime/driverPool"

export async function GET(req: Request) {

  const tenantResult = await requireTenant(req)

  if (!tenantResult.ok) {
    return new Response("Unauthorized", { status: 401 })
  }

  const tenantId = tenantResult.tenant.id

  // driverId query'den al
  const url = new URL(req.url)
  const driverId = url.searchParams.get("driverId")

  if (!driverId) {
    return new Response("driverId required", { status: 400 })
  }

  const stream = new ReadableStream({

    start(controller) {

      const encoder = new TextEncoder()

      // driver pool register
      registerDriver(driverId, (data) => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
          )
        } catch {}
      })

      const unsubscribe = realtimeBus.subscribe((event: RealtimeEvent) => {

        if (event.tenantId !== tenantId) return

        const data = `data: ${JSON.stringify(event)}\n\n`

        controller.enqueue(encoder.encode(data))

      })

      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(
            encoder.encode(": keepalive\n\n")
          )
        } catch {
          clearInterval(keepAlive)
        }
      }, 15000)

      return () => {
        // driver pool unregister
        unregisterDriver(driverId)
        unsubscribe()
        clearInterval(keepAlive)
      }

    }

  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive"
    }
  })

}