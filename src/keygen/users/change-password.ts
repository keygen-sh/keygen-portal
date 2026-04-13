import config from "@/keygen/config"
import client from "@/keygen/client"
import { UserResponse } from "@/types/users"

config.validate()

interface ChangePasswordProps {
  id: string
  oldPassword: string
  newPassword: string
}

export default async function changePassword({
  id,
  oldPassword,
  newPassword,
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
    },
  )) as UserResponse

  return result
}
