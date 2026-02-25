// src/lib/auth.ts
import { prisma } from "@/lib/prisma";

/**
 * Cookie parsing (basit)
 */
function parseCookies(cookieHeader: string | null) {
  const out: Record<string, string> = {};
  if (!cookieHeader) return out;

  cookieHeader.split(";").forEach((part) => {
    const [k, ...rest] = part.trim().split("=");
    if (!k) return;
    out[k] = decodeURIComponent(rest.join("=") ?? "");
  });

  return out;
}

const SESSION_COOKIE = "dc_session";

export async function getUserFromSession(req: Request) {
  const cookies = parseCookies(req.headers.get("cookie"));
  const token = cookies[SESSION_COOKIE] ?? null;
  if (!token) return null;

  const session = await prisma.authSession.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session) return null;

  if (session.expiresAt.getTime() < Date.now()) {
    // opsiyonel temizlik
    await prisma.authSession.delete({ where: { token } }).catch(() => {});
    return null;
  }

  return session.user;
}

/**
 * Zorunlu user guard
 */
export async function requireUser(req: Request) {
  const user = await getUserFromSession(req);
  if (!user) {
    return { ok: false as const, status: 401, error: "Unauthorized" };
  }
  return { ok: true as const, user };
}

/**
 * Membership guard (tenantId + userId)
 */
export async function requireMembership(userId: string, tenantId: string) {
  const membership = await prisma.membership.findUnique({
    where: { tenantId_userId: { tenantId, userId } }, // @@unique([tenantId, userId])
    include: {
      roleBindings: {
        include: {
          role: { include: { permissions: { include: { permission: true } } } },
        },
      },
    },
  });

  if (!membership || membership.status !== "ACTIVE") {
    return { ok: false as const, status: 403, error: "No active membership" };
  }

  return { ok: true as const, membership };
}

/**
 * Permission helper (opsiyonel: roles test için güzel)
 */
export function hasPermission(
  membership: {
    roleBindings: Array<{
      role: {
        permissions: Array<{ permission: { key: string } }>;
      };
    }>;
  },
  permissionKey: string
) {
  return membership.roleBindings.some((rb) =>
    rb.role.permissions.some((rp) => rp.permission.key === permissionKey)
  );
}