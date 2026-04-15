import config from "@/keygen/config"
import client from "@/keygen/client"
import { SecondFactorListResponse } from "@/types/second-factors"

config.validate()

interface ListProps {
  userId: string
}

export default async function list({
  userId,
}: ListProps): Promise<SecondFactorListResponse> {
  const result = (await client.request(
    `/accounts/${config.id}/users/${userId}/second-factors`,
    {
      method: "GET",
      root: true,
    },
  )) as SecondFactorListResponse

  return result
}
