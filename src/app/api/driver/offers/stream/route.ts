import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"
import { eventBus, EVENTS } from "@/lib/events/eventBus"

function sse(event: string, data: unknown) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
}

export async function GET() {
  const session = await getSession()

  if (!session) {
    return new Response(
      JSON.stringify({ error: "Unauthorized (no session)" }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" }
      }
    )
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false

      const pushSnapshot = async () => {
        if (closed) return

        const now = new Date()

        const offers = await prisma.driverOffer.findMany({
          where: {
            driverId: session.userId,
            status: "PENDING",
            expiresAt: {
              gt: now
            }
          },
          orderBy: {
            createdAt: "desc"
          },
          include: {
            job: {
              include: {
                location: true
              }
            }
          }
        })

        controller.enqueue(
          encoder.encode(
            sse("offers.snapshot", {
              ok: true,
              items: offers
            })
          )
        )
      }

      // ilk snapshot
      await pushSnapshot()

      // FAZ31 event listener
      const onOfferCreated = async () => {
        await pushSnapshot()
      }

      eventBus.on(EVENTS.OFFER_CREATED, onOfferCreated)

      // heartbeat
      const heartbeat = setInterval(() => {
        if (closed) return

        controller.enqueue(
          encoder.encode(
            sse("ping", { ts: Date.now() })
          )
        )
      }, 15000)

      const close = () => {
        if (closed) return
        closed = true

        clearInterval(heartbeat)

        // eventbus cleanup
        eventBus.off(EVENTS.OFFER_CREATED, onOfferCreated)

        controller.close()
      }

      // @ts-expect-error: ReadableStream controller typing does not expose signal in Node
      controller.signal?.addEventListener?.("abort", close)
    },

    cancel() {
      // no-op
    }
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive"
    }
  })
}
