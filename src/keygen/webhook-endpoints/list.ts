import config from "@/keygen/config"
import client from "@/keygen/client"
import { WebhookEndpointListResponse } from "@/types/webhook-endpoints"

config.validate()

interface ListProps {
  limit?: number
  pageCursor?: string | null
  pageSize?: number
}

export default async function list({
  limit,
  pageCursor,
  pageSize,
}: ListProps): Promise<WebhookEndpointListResponse> {
  const params = new URLSearchParams()
  if (limit != null) {
    params.set("limit", limit.toString())
  }
  if (pageSize != null) {
    params.set("page[size]", pageSize.toString())
    params.set("page[cursor]", pageCursor ?? "")
  }

  const result = (await client.request(
    `/accounts/${config.id}/webhook-endpoints?${params.toString()}`,
    {
      method: "GET",
    },
  )) as WebhookEndpointListResponse

  return result
}
