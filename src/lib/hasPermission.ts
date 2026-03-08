import { prisma } from "@/lib/prisma"

export async function hasPermission(
  userId: string,
  tenantId: string,
  permissionKey: string
) {

  const membership = await prisma.membership.findFirst({
    where: {
      userId,
      tenantId,
      status: "ACTIVE"
    },
    include: {
      roleBindings: {
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true
                }
              }
            }
          }
        }
      }
    }
  })

  if (!membership) return false

  const permissions = membership.roleBindings
    .flatMap(rb => rb.role.permissions)
    .map(p => p.permission.key)

  return permissions.includes(permissionKey)
}