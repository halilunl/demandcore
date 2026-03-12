import { publishEvent } from "@/lib/realtime/publish"
import { requireTenant } from "@/lib/tenant"

export async function POST(req: Request) {

  const tenantResult = await requireTenant(req)

  if (!tenantResult.ok) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  publishEvent({
      type: "job.created",
      tenantId: tenantResult.tenant.id,
      entity: "job",
      entityId: "test",
      at: ""
  })

  return Response.json({
    ok: true
  })

}