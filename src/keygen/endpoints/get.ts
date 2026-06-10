import config from "@/keygen/config"
import client from "@/keygen/client"
import { EndpointResponse } from "@/types/endpoints"

config.validate()

interface GetProps {
  id: string
}

export default async function get({ id }: GetProps): Promise<EndpointResponse> {
  const result = (await client.request(
    `/accounts/${config.id}/webhook-endpoints/${id}`,
    {
      method: "GET",
    },
  )) as EndpointResponse

  return result
}
