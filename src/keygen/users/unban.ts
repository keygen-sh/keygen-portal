import config from "@/keygen/config"
import client from "@/keygen/client"

import { UserResponse } from "@/types/users"

config.validate()

interface UnbanProps {
  id: string
}

export default async function unban({ id }: UnbanProps): Promise<UserResponse> {
  const result = (await client.request(
    `/accounts/${config.id}/users/${id}/actions/unban`,
    { method: "POST" },
  )) as UserResponse

  return result
}
