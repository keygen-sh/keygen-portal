import config from "@/keygen/config"
import client from "@/keygen/client"

import {
  SearchOperator,
  type SearchQuery,
  SearchableResource,
} from "@/types/search"
import { type APIResponse, type AnyResource } from "@/types/api"

config.validate()

interface SearchProps {
  type: SearchableResource
  query: SearchQuery
  op?: SearchOperator
}

export async function search({
  type,
  query,
  op,
}: SearchProps): Promise<APIResponse<AnyResource[]>> {
  return await client.request(`/accounts/${config.id}/search`, {
    method: "POST",
    body: JSON.stringify({
      meta: {
        type,
        ...(op ? { op } : {}),
        query,
      },
    }),
  })
}
