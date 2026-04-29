import config from "@/keygen/config"
import client from "@/keygen/client"
import { APIResponse } from "@/types/api"

config.validate()

interface RevokeProps {
  id: string
}

export default async function revoke({
  id,
}: RevokeProps): Promise<APIResponse<null>> {
  return client.request<null>(`/accounts/${config.id}/tokens/${id}`, {
    method: "DELETE",
    root: true,
  })
}
