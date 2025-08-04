import config from "@/keygen/config"
import client from "@/keygen/client"
import { TokenResponse, CreateTokenPayload } from "@/types/tokens"

config.validate()

export default async function create({
  relationships,
}: {
  relationships: CreateTokenPayload
}): Promise<TokenResponse> {
  const body = { data: { type: "tokens", relationships } }

  const result = (await client.request(`/accounts/${config.id}/tokens`, {
    method: "POST",
    root: true,
    body: JSON.stringify(body),
  })) as TokenResponse

  return result
}
