import { realtimeBus } from "./bus"
import { RealtimeEvent } from "./events"

export function publishEvent(event: RealtimeEvent) {

  realtimeBus.publish({
    ...event,
    at: new Date().toISOString()
  })

}