import config from "@/keygen/config"
import { Client } from "@/keygen/client"
import { TokenResponse } from "@/types/tokens"

config.validate()

interface VerifyProps {
  tokenId: string
  token: string
  environment?: string | null
}

/**
 * Checks user token validity with the Keygen API.
 * If the response returns a 401, the token is invalid, otherwise it's still valid.
 */
export async function verify({
  tokenId,
  token,
  environment,
}: VerifyProps): Promise<TokenResponse> {
  const tempClient = new Client(token)
  tempClient.setSessionEnvironment(environment ?? null)

  const result = (await tempClient.request(
    `/accounts/${config.id}/tokens/${tokenId}`,
    { method: "GET" },
  )) as TokenResponse

  return result
}
