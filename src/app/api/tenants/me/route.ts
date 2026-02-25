import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantSlugFromRequest } from "@/lib/tenant";

export async function GET(req: Request) {
  const slug = getTenantSlugFromRequest(req);
  if (!slug) return NextResponse.json({ error: "TENANT_NOT_FOUND" }, { status: 400 });

  const tenant = await prisma.tenant.findUnique({ where: { slug } });
  if (!tenant) return NextResponse.json({ error: "TENANT_NOT_FOUND" }, { status: 404 });

  return NextResponse.json({ tenant });
}