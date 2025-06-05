import config from "@/keygen/config"
import client from "@/keygen/client"
import { AuthResponse } from "@/types/auth"

// Make sure environment variables exist
config.validate()

interface AuthProps {
  email: string
  password?: string
  otp?: string
}

/**
 * Authenticates user with Keygen API using email and optional password or one-time password.
 * If both password and otp are omitted, returns either OTP_REQUIRED or PASSWORD_REQUIRED codes stored in { errors }.
 * On success, returns a token object stored in { data }.
 */
export async function authenticate({
  email,
  password,
  otp,
}: AuthProps): Promise<AuthResponse> {
  const credentials = btoa(
    unescape(encodeURIComponent(`${email || ""}:${password || ""}`)),
  )

  const body = otp != null ? JSON.stringify({ meta: { otp } }) : undefined

  const result = (await client.request("/tokens", {
    method: "POST",
    headers: { Authorization: `Basic ${credentials}` },
    body,
  })) as AuthResponse

  return result
}
