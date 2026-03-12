import { RealtimeEvent } from "./events"

type Subscriber = (event: RealtimeEvent) => void

class EventBus {

  private subscribers: Set<Subscriber> = new Set()

  subscribe(fn: Subscriber) {
    this.subscribers.add(fn)

    return () => {
      this.subscribers.delete(fn)
    }
  }

  publish(event: RealtimeEvent) {

    for (const sub of this.subscribers) {
      sub(event)
    }

  }

}

export const realtimeBus = new EventBus()