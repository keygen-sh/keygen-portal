import config from "@/keygen/config"
import client from "@/keygen/client"
import { type APIResponse, type AnyResource } from "@/types/api"

config.validate()

interface SearchProps {
  type: "users" | "licenses" | "machines" | "groups"
  query: Record<string, string>
  op?: "AND" | "OR"
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
