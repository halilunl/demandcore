export type RealtimeEntity =
  | "job"
  | "offer"
  | "driver"

export type RealtimeEventType =
  | "job.created"
  | "job.updated"
  | "offer.broadcasted"
  | "offer.accepted"
  | "driver.online"
  | "driver.offline"

export type RealtimeEvent = {
  type: RealtimeEventType
  tenantId: string
  entity: RealtimeEntity
  entityId: string
  at: string
  payload?: Record<string, unknown>
}