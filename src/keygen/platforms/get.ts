import config from "@/keygen/config"
import client from "@/keygen/client"
import { PlatformResponse } from "@/types/platforms"

config.validate()

interface GetProps {
  id: string
}

export default async function get({ id }: GetProps): Promise<PlatformResponse> {
  const result = (await client.request(
    `/accounts/${config.id}/platforms/${id}`,
    {
      method: "GET",
    },
  )) as PlatformResponse

  return result
}
