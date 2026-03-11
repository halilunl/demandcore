import { NextResponse } from "next/server";
import "@/lib/workers"

export async function GET() {
  return NextResponse.json({ ok: true, service: "demandcore" });
}