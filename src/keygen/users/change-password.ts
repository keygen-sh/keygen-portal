import config from "@/keygen/config"
import client from "@/keygen/client"
import { UserResponse } from "@/types/users"

config.validate()

interface ChangePasswordProps {
  id: string
  oldPassword: string
  newPassword: string
  root?: boolean
}

export default async function changePassword({
  id,
  oldPassword,
  newPassword,
  root,
}: ChangePasswordProps): Promise<UserResponse> {
  const body = {
    meta: {
      oldPassword,
      newPassword,
    },
  }

  const result = (await client.request(
    `/accounts/${config.id}/users/${id}/actions/update-password`,
    {
      method: "POST",
      body: JSON.stringify(body),
      root,
    },
  )) as UserResponse

  return result
}
