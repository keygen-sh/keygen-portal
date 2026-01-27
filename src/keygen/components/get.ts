import config from "@/keygen/config"
import client from "@/keygen/client"
import { ComponentResponse } from "@/types/components"

config.validate()

interface GetProps {
  id: string
}

export default async function get({
  id,
}: GetProps): Promise<ComponentResponse> {
  const result = (await client.request(
    `/accounts/${config.id}/components/${id}`,
    {
      method: "GET",
    },
  )) as ComponentResponse

  return result
}
