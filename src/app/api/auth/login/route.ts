import { NextResponse } from "next/server"
import * as bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

function randomToken() {
  return crypto.randomUUID().replaceAll("-", "")
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const email = body?.email?.toLowerCase()?.trim()
  const password = body?.password?.toString() ?? ""

  if (!email || !password) {
    return NextResponse.json({ error: "email/password required" }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      password: true,
    }
  })

  // 🟢 user null olabilir
  if (!user || !user.password) {
    return NextResponse.json(
      { error: "Invalid credentials" },
      { status: 401 }
    )
  }

  const ok = await bcrypt.compare(password, user.password)

  if (!ok) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  }

  const token = randomToken()
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7) // 7 gün

  await prisma.authSession.create({
    data: { token, userId: user.id, expiresAt },
  })

  // 🔵 AUDIT LOG
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "LOGIN_SUCCESS",
      entity: "auth",
      entityId: user.id
    }
  })

  const res = NextResponse.json({ ok: true })

  res.cookies.set("dc_session", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  })

  return res
}