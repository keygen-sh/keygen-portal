import config from "@/keygen/config"
import client from "@/keygen/client"
import { RequestLogResponse } from "@/types/request-logs"

config.validate()

interface GetProps {
  id: string
}

export default async function get({
  id,
}: GetProps): Promise<RequestLogResponse> {
  const result = (await client.request(
    `/accounts/${config.id}/request-logs/${id}`,
    {
      method: "GET",
    },
  )) as RequestLogResponse

  return result
}
