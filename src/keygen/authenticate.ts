import config from "@/keygen/config"
import client from "@/keygen/client"
import { AuthResponse } from "@/types/auth"

config.validate()

const LOGIN_TOKEN_NAME = "Portal Token"

interface AuthProps {
  email: string
  password?: string
  otp?: string
  account?: string
}

export async function authenticate({
  email,
  password,
  otp,
  account,
}: AuthProps): Promise<AuthResponse> {
  const credentials = btoa(
    unescape(encodeURIComponent(`${email || ""}:${password || ""}`)),
  )

  const body = JSON.stringify({
    data: {
      type: "tokens",
      attributes: { name: LOGIN_TOKEN_NAME },
    },
    ...(otp != null ? { meta: { otp } } : {}),
  })

  const result = (await client.request(
    `/accounts/${account ?? config.id}/tokens`,
    {
      method: "POST",
      headers: { Authorization: `Basic ${credentials}` },
      body,
    },
  )) as AuthResponse

  return result
}
