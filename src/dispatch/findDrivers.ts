import { prisma } from "@/lib/prisma"
import { distanceKm } from "./distance"

type JobInput = {
  location: {
    lat: number
    lng: number
  } | null
}

export async function findDrivers(job: JobInput) {

  const jobLat = job.location?.lat
  const jobLng = job.location?.lng

  if (!jobLat || !jobLng) return []

  const drivers = await prisma.driverLocation.findMany()

  const results = drivers.map(d => {

    const dist = distanceKm(
      jobLat,
      jobLng,
      d.lat,
      d.lng
    )

    return {
      userId: d.userId,
      lat: d.lat,
      lng: d.lng,
      distance: dist
    }

  })

  const filtered = results.filter(d => d.distance <= 10)

  filtered.sort((a, b) => a.distance - b.distance)

  return filtered.slice(0, 3)
}