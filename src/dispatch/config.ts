import { prisma } from "@/lib/prisma"

export async function getDispatchConfig(tenantId?: string) {

  const config = await prisma.dispatchConfig.findFirst({
    where: {
      tenantId: tenantId ?? null
    }
  })

  if (!config) {
    return {
      radiusKm: 3,
      maxDrivers: 3,
      offerTimeoutSec: 10,
      dispatchMode: "SEQUENTIAL"
    }
  }

  return config
}