import { realtimeBus } from "@/lib/realtime/bus"
import { RealtimeEvent } from "@/lib/realtime/events"
import { requireTenant } from "@/lib/tenant"

export async function GET(req: Request) {

  const tenantResult = await requireTenant(req)

  if (!tenantResult.ok) {
    return new Response("Unauthorized", { status: 401 })
  }

  const tenantId = tenantResult.tenant.id

  const stream = new ReadableStream({

    start(controller) {

      const encoder = new TextEncoder()

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