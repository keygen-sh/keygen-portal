import config from "@/keygen/config"
import client from "@/keygen/client"
import { AccountResponse } from "@/types/accounts"

config.validate()

interface UpdateProps {
  values: {
    name?: string
    slug?: string
    apiVersion?: string
    protected?: boolean
  }
}

export default async function update({
  values,
}: UpdateProps): Promise<AccountResponse> {
  const body = {
    data: {
      type: "accounts",
      attributes: values,
    },
  }

  const result = (await client.request(`/accounts/${config.id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  })) as AccountResponse

  return result
}
