import { addWeeks } from "date-fns"

import { AuthResponse } from "@/types/auth"

import config from "@/keygen/config"
import client, { Client } from "@/keygen/client"
import * as activeEnvironment from "@/keygen/active-environment"
import * as rootEnvironment from "@/keygen/root-environment"

config.validate()

const LOGIN_TOKEN_NAME = "Portal Token"
const SESSION_EXPIRY_WEEKS = 2

interface AuthProps {
  email: string
  password?: string
  otp?: string
  account?: string
  environment?: string | null
}

export async function authenticate(props: AuthProps): Promise<AuthResponse> {
  activeEnvironment.clear()
  rootEnvironment.release()

  return generateToken(client, props)
}

export async function reauthenticate(
  props: Pick<AuthProps, "email" | "password" | "otp" | "environment">,
): Promise<AuthResponse> {
  return generateToken(new Client(), props)
}

async function generateToken(
  requester: Client,
  { email, password, otp, account, environment }: AuthProps,
): Promise<AuthResponse> {
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

  const result = (await requester.request(
    `/accounts/${account ?? config.id}/tokens`,
    {
      method: "POST",
      headers: { Authorization: `Basic ${credentials}` },
      environment: environment ?? null,
      body,
    },
  )) as AuthResponse

  return result
}
