import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

export async function writeAuditLog({
  tenantId,
  userId,
  action,
  entity,
  entityId,
  oldValue,
  newValue,
  req,
}: {
  tenantId?: string
  userId?: string
  action: string
  entity: string
  entityId?: string
  oldValue?: Prisma.InputJsonValue
  newValue?: Prisma.InputJsonValue
  req?: Request
}) {
  try {
    await prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action,
        entity,
        entityId,
        oldValue: oldValue ?? undefined,
        newValue: newValue ?? undefined,
        ipAddress: req?.headers.get("x-forwarded-for") ?? null,
        userAgent: req?.headers.get("user-agent") ?? null,
      },
    })
  } catch (err) {
    console.error("Audit log yazılamadı:", err)
  }
}