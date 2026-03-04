import config from "@/keygen/config"
import client from "@/keygen/client"

import { UserResponse } from "@/types/users"

config.validate()

interface ChangeGroupProps {
  id: string
  groupId: string | null
}

export default async function changeGroup({
  id,
  groupId,
}: ChangeGroupProps): Promise<UserResponse> {
  const body = {
    data: groupId ? { type: "groups", id: groupId } : null,
  }

  const result = (await client.request(
    `/accounts/${config.id}/users/${id}/group`,
    {
      method: "PUT",
      body: JSON.stringify(body),
    },
  )) as UserResponse

  return result
}
