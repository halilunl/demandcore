// src/app/api/me/route.ts
import { NextResponse } from "next/server";
import { requireTenant } from "@/lib/tenant";
import { getUserFromSession } from "@/lib/auth";
import { resolveAccess } from "@/lib/access";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const t = await requireTenant(req);
  if (!t.ok) return NextResponse.json({ error: t.error }, { status: t.status });

  const user = await getUserFromSession(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const access = await resolveAccess({ tenantId: t.tenant.id, userId: user.id });
  if (!access) {
    return NextResponse.json({ error: "No membership for tenant" }, { status: 403 });
  }

  // membership status guard (opsiyonel ama doğru)
  if (access.membership.status !== "ACTIVE") {
    return NextResponse.json(
      { error: `Membership not active (${access.membership.status})` },
      { status: 403 }
    );
  }

  return NextResponse.json({
    tenant: { id: t.tenant.id, slug: t.tenant.slug, name: t.tenant.name },
    user: { id: user.id, email: user.email, name: user.name },
    membership: access.membership,
    roles: access.roles,
    permissions: access.permissions,
  });
}