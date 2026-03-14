import { EventEmitter } from "events"

export const eventBus = new EventEmitter()

export const EVENTS = {
  OFFER_CREATED: "offer.created",
  OFFER_UPDATED: "offer.updated",
  OFFER_REMOVED: "offer.removed"
} as const
