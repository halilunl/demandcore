import { NextResponse } from "next/server";
import { requireTenant } from "@/lib/tenant";
import { requireUser } from "@/lib/auth";
import { resolveAccess } from "@/lib/access";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const t = await requireTenant(req);
  if (!t.ok) return NextResponse.json({ error: t.error }, { status: t.status });

  const u = await requireUser(req);
  if (!u.ok) return NextResponse.json({ error: u.error }, { status: u.status });

  const access = await resolveAccess({ tenantId: t.tenant.id, userId: u.user.id });
  if (!access) return NextResponse.json({ error: "No membership" }, { status: 403 });

  const canSeeAdmin =
    access.roles.includes("ADMIN") || access.roles.includes("OWNER");

  const canAssign = access.permissions.includes("ops.assign");

  return NextResponse.json({
    ok: true,
    roles: access.roles,
    permissions: access.permissions,
    permissionsCount: access.permissions.length,
    canSeeAdmin,
    canAssign,
  });
}