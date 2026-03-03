import config from "@/keygen/config"
import client from "@/keygen/client"

import { APIError } from "@/types/api"

config.validate()

interface AttachUsersProps {
  licenseId: string
  userIds: string[]
}

export default async function attachUsers({
  licenseId,
  userIds,
}: AttachUsersProps): Promise<null> {
  const body = {
    data: userIds.map((id) => ({
      type: "users",
      id,
    })),
  }

  const response = await client.request(
    `/accounts/${config.id}/licenses/${licenseId}/users`,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  )

  if (response.errors) {
    throw new APIError(response.errors[0])
  }

  return null
}
