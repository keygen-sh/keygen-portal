import config from "@/keygen/config"
import client from "@/keygen/client"
import { APIResponse } from "@/types/api"
import { AccountSetting } from "@/types/accounts"

config.validate()

interface UpsertSettingProps {
  id?: string
  key: string
  value: string[] | null
}

export default async function updateSetting({
  id,
  key,
  value,
}: UpsertSettingProps): Promise<APIResponse<AccountSetting>> {
  if (id) {
    // Update existing setting
    const body = {
      data: {
        type: "settings",
        attributes: { value },
      },
    }

    return await client.request(`/accounts/${config.id}/settings/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    })
  }

  // Create new setting
  const body = {
    data: {
      type: "settings",
      attributes: { key, value },
    },
  }

  return await client.request(`/accounts/${config.id}/settings`, {
    method: "POST",
    body: JSON.stringify(body),
  })
}
