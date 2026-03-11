import { cookies } from "next/headers"

export async function getSession() {
  const cookieStore = cookies()

  const session = (await cookieStore).get("dc_session")

  if (!session) {
    return null
  }

  // şimdilik basit döndürüyoruz
  // ileride DB session ekleyebiliriz
  return {
    userId: session.value
  }
}