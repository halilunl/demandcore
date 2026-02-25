// src/lib/tenant.ts
import { prisma } from "@/lib/prisma";

export function getTenantSlugFromRequest(req: Request): string | null {
  const raw = req.headers.get("x-tenant");
  const slug = raw?.trim().toLowerCase();
  return slug ? slug : null;
}

export async function requireTenant(req: Request) {
  const slug = getTenantSlugFromRequest(req);
  if (!slug) {
    return { ok: false as const, status: 400, error: "No tenant header" };
  }

  const tenant = await prisma.tenant.findUnique({ where: { slug } });
  if (!tenant) {
    return { ok: false as const, status: 404, error: "Tenant not found" };
  }

  return { ok: true as const, slug, tenant };
}