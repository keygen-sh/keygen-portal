import config from "@/keygen/config"
import client from "@/keygen/client"

import { APIError } from "@/types/api"

config.validate()

interface DetachUsersProps {
  licenseId: string
  userIds: string[]
}

export default async function detachUsers({
  licenseId,
  userIds,
}: DetachUsersProps): Promise<null> {
  const body = {
    data: userIds.map((id) => ({
      type: "users",
      id,
    })),
  }

  const response = await client.request(
    `/accounts/${config.id}/licenses/${licenseId}/users`,
    {
      method: "DELETE",
      body: JSON.stringify(body),
    },
  )

  if (response.errors) {
    throw new APIError(response.errors[0])
  }

  return null
}
