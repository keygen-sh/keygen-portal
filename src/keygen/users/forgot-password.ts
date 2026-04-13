import config from "@/keygen/config"
import client from "@/keygen/client"

import { APIResponse } from "@/types/api"

config.validate()

interface ForgotProps {
  email: string
}

export default async function forgot({
  email,
}: ForgotProps): Promise<APIResponse<void>> {
  const body = {
    meta: {
      email,
    },
  }

  const result = await client.request<void>(
    `/accounts/${config.id}/passwords`,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  )

  return result
}
