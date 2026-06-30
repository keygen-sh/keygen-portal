import config from "@/keygen/config"
import client from "@/keygen/client"
import { TokenResponse } from "@/types/tokens"

config.validate()

interface RegenerateProps {
  id: string
}

export default async function regenerate({
  id,
}: RegenerateProps): Promise<TokenResponse> {
  const result = (await client.request(`/accounts/${config.id}/tokens/${id}`, {
    method: "PUT",
  })) as TokenResponse

  return result
}
