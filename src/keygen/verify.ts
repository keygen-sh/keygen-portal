import config from "@/keygen/config"
import { Client } from "@/keygen/client"
import { EnvironmentResponse } from "@/types/environments"

config.validate()

interface VerifyProps {
  tokenId: string
  token: string
}

/**
 * Checks user token validity with the Keygen API.
 * If the response returns a 401, the token is invalid, otherwise it's still valid.
 */
export async function verify({
  tokenId,
  token,
}: VerifyProps): Promise<EnvironmentResponse> {
  const tempClient = new Client(token)

  const result = (await tempClient.request(
    `/accounts/${config.id}/tokens/${tokenId}`,
    { method: "GET" },
  )) as EnvironmentResponse

  return result
}
