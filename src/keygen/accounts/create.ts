import config from "@/keygen/config"
import client from "@/keygen/client"

import { AccountResponse } from "@/types/accounts"

import * as Schemas from "@/schemas"

config.validate()

export default async function create(
  values: Schemas.Auth.RegisterValues,
): Promise<AccountResponse> {
  const { email, password } = values

  if (!config.defaultPlanId) {
    throw new Error("VITE_KEYGEN_DEFAULT_PLAN_ID is not configured.")
  }

  const body = {
    data: {
      type: "accounts",
      relationships: {
        plan: {
          data: { type: "plans", id: config.defaultPlanId },
        },
        admins: {
          data: [{ type: "users", attributes: { email, password } }],
        },
      },
    },
  }

  const result = (await client.request("/accounts", {
    method: "POST",
    body: JSON.stringify(body),
  })) as AccountResponse

  return result
}
