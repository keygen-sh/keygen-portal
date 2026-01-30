import config from "@/keygen/config"
import client from "@/keygen/client"
import { ProcessResponse } from "@/types/processes"

config.validate()

interface GetProps {
  id: string
}

export default async function get({ id }: GetProps): Promise<ProcessResponse> {
  const result = (await client.request(
    `/accounts/${config.id}/processes/${id}`,
    {
      method: "GET",
    },
  )) as ProcessResponse

  return result
}
