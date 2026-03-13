type DriverConnection = {
  driverId: string
  send: (data: unknown) => void
}

const drivers = new Map<string, DriverConnection>()

export function registerDriver(driverId: string, send: (data: unknown) => void) {
  drivers.set(driverId, { driverId, send })
}

export function unregisterDriver(driverId: string) {
  drivers.delete(driverId)
}

export function sendToDriver(driverId: string, payload: unknown) {
  const conn = drivers.get(driverId)
  if (!conn) return

  conn.send(payload)
}

export function getConnectedDrivers() {
  return Array.from(drivers.keys())
}