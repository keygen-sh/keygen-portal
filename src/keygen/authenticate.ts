import { addWeeks } from "date-fns"

import { AuthResponse } from "@/types/auth"

import config from "@/keygen/config"
import client from "@/keygen/client"
import { clearEnvironment } from "@/keygen/environment"

config.validate()

const LOGIN_TOKEN_NAME = "Portal Token"
const SESSION_EXPIRY_WEEKS = 2

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
  clearEnvironment()

  const credentials = btoa(
    unescape(encodeURIComponent(`${email || ""}:${password || ""}`)),
  )

  const expiry = addWeeks(new Date(), SESSION_EXPIRY_WEEKS).toISOString()

  const body = JSON.stringify({
    data: {
      type: "tokens",
      attributes: {
        name: LOGIN_TOKEN_NAME,
        expiry,
      },
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
