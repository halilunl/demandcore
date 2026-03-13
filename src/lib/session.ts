import { cookies } from "next/headers"

export async function getSession() {
  const cookieStore = await cookies()

  const session = cookieStore.get("dc_session")

  if (!session) {
    return null
  }

  return {
    userId: session.value
  }
}