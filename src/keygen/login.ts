import client from "@/keygen/client"
import config from "@/keygen/config"
import * as rootEnvironment from "@/keygen/root-environment"
import * as tokens from "@/keygen/tokens"
import type { AuthData } from "@/types/auth"

interface LoginOptions {
  remember?: boolean
  environment?: string | null
}

export async function login(
  data: AuthData,
  { remember = false, environment }: LoginOptions = {},
): Promise<{ userId: string; accountId: string }> {
  const { id: tokenId, attributes, relationships } = data
  const { token } = attributes
  const userId = relationships.bearer.data.id
  const accountId = relationships.account.data.id

  const storage = remember ? localStorage : sessionStorage
  const other = remember ? sessionStorage : localStorage
  other.removeItem("tokenId")
  other.removeItem("token")

  storage.setItem("tokenId", tokenId)
  client.setTokenId(tokenId)

  if (config.isTokenAuthenticated) {
    storage.setItem("token", token)
    client.setRootToken(token)
  }

  client.setAccount(accountId)
  client.setUser(userId)

  const environmentId = relationships.environment?.data?.id ?? null
  if (environmentId) {
    rootEnvironment.set({
      tokenId,
      id: environmentId,
      code: environment && environment !== environmentId ? environment : null,
      name: null,
    })
    await rootEnvironment.resolve()
  } else {
    rootEnvironment.clear()
  }

  return { userId, accountId }
}

export async function relogin(
  data: AuthData,
): Promise<{ userId: string; accountId: string }> {
  const tokenId = client.currentTokenId
  const remember = localStorage.getItem("tokenId") != null

  if (tokenId) {
    try {
      await tokens.revoke({ id: tokenId })
    } catch (error) {
      console.error("Failed to revoke token on relogin", error)
    }
  }

  return login(data, { remember })
}
