import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

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

      await pushSnapshot()

      const heartbeat = setInterval(() => {
        if (closed) return
        controller.enqueue(encoder.encode(sse("ping", { ts: Date.now() })))
      }, 15000)

      // Geçici faz30 yaklaşımı:
      // ince-grain event yerine kısa aralıkta refresh ya da merkezi event bus bağlanacak.
      const refresh = setInterval(async () => {
        await pushSnapshot()
      }, 5000)

      const close = () => {
        if (closed) return
        closed = true
        clearInterval(heartbeat)
        clearInterval(refresh)
        controller.close()
      }

      // Web stream disconnect güvenliği
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
