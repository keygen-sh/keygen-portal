import config from "@/keygen/config"
import client from "@/keygen/client"
import { UserResponse } from "@/types/users"

config.validate()

interface ResetPasswordProps {
  id: string
  token: string
  newPassword: string
}

export default async function resetPassword({
  id,
  token,
  newPassword,
}: ResetPasswordProps): Promise<UserResponse> {
  const body = {
    meta: {
      passwordResetToken: token,
      newPassword,
    },
  }

  const result = (await client.request(
    `/accounts/${config.id}/users/${id}/actions/reset-password`,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  )) as UserResponse

  return result
}
