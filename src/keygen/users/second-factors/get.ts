import config from "@/keygen/config"
import client from "@/keygen/client"
import { SecondFactorResponse } from "@/types/second-factors"

config.validate()

interface GetProps {
  userId: string
  id: string
}

export default async function get({
  userId,
  id,
}: GetProps): Promise<SecondFactorResponse> {
  const result = (await client.request(
    `/accounts/${config.id}/users/${userId}/second-factors/${id}`,
    {
      method: "GET",
      root: client.currentUser === userId,
    },
  )) as SecondFactorResponse

  return result
}
