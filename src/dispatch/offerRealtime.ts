import { sendToDriver } from "@/realtime/driverPool"

export async function broadcastRealtimeOffer(
  jobId: string,
  drivers: { id: string }[]
) {
  for (const d of drivers) {
    sendToDriver(d.id, {
      type: "JOB_OFFER",
      jobId
    })
  }

  console.log(`Realtime offer broadcast: ${drivers.length} drivers`)
}