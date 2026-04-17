import config from "@/keygen/config"
import client from "@/keygen/client"
import { SecondFactorResponse } from "@/types/second-factors"

config.validate()

interface UpdateProps {
  userId: string
  id: string
  enabled: boolean
  otp: string
}

export default async function update({
  userId,
  id,
  enabled,
  otp,
}: UpdateProps): Promise<SecondFactorResponse> {
  const body = {
    data: {
      type: "second-factors",
      id,
      attributes: { enabled },
    },
    meta: { otp },
  }

  const result = (await client.request(
    `/accounts/${config.id}/users/${userId}/second-factors/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
      root: client.currentUser === userId,
    },
  )) as SecondFactorResponse

  return result
}
