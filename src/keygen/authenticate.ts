import config from "@/keygen/config"
import client from "@/keygen/client"
import { AuthResponse } from "@/types/auth"

config.validate()

interface AuthProps {
  email: string
  password?: string
  otp?: string
}

export async function authenticate({
  email,
  password,
  otp,
}: AuthProps): Promise<AuthResponse> {
  const credentials = btoa(
    unescape(encodeURIComponent(`${email || ""}:${password || ""}`)),
  )

  const body = otp != null ? JSON.stringify({ meta: { otp } }) : undefined

  const result = (await client.request(`/accounts/${config.id}/tokens`, {
    method: "POST",
    headers: { Authorization: `Basic ${credentials}` },
    body,
  })) as AuthResponse

  return result
}
