// src/lib/access.ts
import { prisma } from "@/lib/prisma";

export async function resolveAccess({
  tenantId,
  userId,
}: {
  tenantId: string;
  userId: string;
}) {
  const membership = await prisma.membership.findUnique({
    where: {
      tenantId_userId: { tenantId, userId }, // @@unique([tenantId, userId])
    },
    include: {
      roleBindings: {
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!membership) return null;

  const roles = membership.roleBindings.map((rb) => rb.role.key);

  const permissions = Array.from(
    new Set(
      membership.roleBindings.flatMap((rb) =>
        rb.role.permissions.map((rp) => rp.permission.key)
      )
    )
  );

  return {
    membership,
    roles,
    permissions,
  };
}