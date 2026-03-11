import { prisma } from "@/lib/prisma"
import { haversineDistance } from "@/lib/geo/distance"
import { getDispatchConfig } from "./config"

type JobInput = {
  tenantId?: string
  requiredCapabilityId?: string | null
  location: {
    lat: number
    lng: number
  } | null
}

export async function findDrivers(job: JobInput) {

  const jobLat = job.location?.lat
  const jobLng = job.location?.lng

  if (jobLat == null || jobLng == null) return []

  // FAZ20 config yükle
  const config = await getDispatchConfig(job.tenantId)

  const RADIUS_KM = config.radiusKm
  const MAX_DRIVERS = config.maxDrivers

  const drivers = await prisma.driverLocation.findMany({
    where: {
      user: {
        driverStatus: "ONLINE",
        ...(job.requiredCapabilityId
          ? {
              driverCapabilities: {
                some: {
                  capabilityId: job.requiredCapabilityId
                }
              }
            }
          : {})
      }
    },
    include: {
      user: true
    }
  })

  const results = drivers.map((d) => {
    const dist = haversineDistance(jobLat, jobLng, d.lat, d.lng)

    return {
      userId: d.userId,
      lat: d.lat,
      lng: d.lng,
      distance: dist
    }
  })

  const filtered = results
    .filter((d) => d.distance <= RADIUS_KM)
    .sort((a, b) => a.distance - b.distance)

  return filtered.slice(0, MAX_DRIVERS)
}