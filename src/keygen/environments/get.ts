import config from "@/keygen/config"
import client from "@/keygen/client"
import { EnvironmentResponse } from "@/types/environments"

config.validate()

interface GetProps {
  id: string
}

export default async function get({
  id,
}: GetProps): Promise<EnvironmentResponse> {
  const result = (await client.request(
    `accounts/${config.id}/environments${id}`,
    {
      method: "GET",
    },
  )) as EnvironmentResponse

  return result
}
