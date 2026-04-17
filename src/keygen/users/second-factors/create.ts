import config from "@/keygen/config"
import client from "@/keygen/client"
import { SecondFactorResponse } from "@/types/second-factors"

config.validate()

interface CreateProps {
  userId: string
  password?: string
  otp?: string
}

export default async function create({
  userId,
  password,
  otp,
}: CreateProps): Promise<SecondFactorResponse> {
  const body = {
    meta: {
      ...(password != null ? { password } : {}),
      ...(otp != null ? { otp } : {}),
    },
  }

  const result = (await client.request(
    `/accounts/${config.id}/users/${userId}/second-factors`,
    {
      method: "POST",
      body: JSON.stringify(body),
      root: client.currentUser === userId,
    },
  )) as SecondFactorResponse

  return result
}
