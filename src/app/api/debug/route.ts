export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function GET(req: Request) {
  const slug = req.headers.get("x-tenant");

  if (!slug) {
    return NextResponse.json({ error: "No tenant header" }, { status: 400 });
  }

  const tenant = await prisma.tenant.findUnique({
    where: { slug },
  });

  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: tenant.id,
    slug: tenant.slug,
    name: tenant.name,
  });
}