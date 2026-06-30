import config from "@/keygen/config"
import client from "@/keygen/client"
import { TokenResponse } from "@/types/tokens"

config.validate()

interface GetProps {
  id: string
}

export default async function get({ id }: GetProps): Promise<TokenResponse> {
  const result = (await client.request(`/accounts/${config.id}/tokens/${id}`, {
    method: "GET",
  })) as TokenResponse

  return result
}
