import config from "@/keygen/config"
import { Client } from "@/keygen/client"
import { APIResponse } from "@/types/api"

config.validate()

interface VerifyProps {
  tokenId: string
  token: string
}

interface TokenData {
  id: string
  type: "tokens"
  attributes: Record<string, unknown>
  relationships: {
    bearer: {
      data: {
        id: string
        type: string
      }
    }
    [key: string]: unknown
  }
}

export type VerifyResponse = APIResponse<TokenData>

/**
 * Checks user token validity with the Keygen API.
 * If the response returns a 401, the token is invalid, otherwise it's still valid.
 */
export async function verify({
  tokenId,
  token,
}: VerifyProps): Promise<VerifyResponse> {
  const tempClient = new Client(token)

  const result = (await tempClient.request(
    `/accounts/${config.id}/tokens/${tokenId}`,
    { method: "GET" },
  )) as VerifyResponse

  return result
}
