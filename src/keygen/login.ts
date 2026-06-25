import client from "@/keygen/client"
import config from "@/keygen/config"
import type { Auth } from "@/types/auth"

interface LoginOptions {
  remember?: boolean
}

export function login(
  data: Auth,
  { remember = false }: LoginOptions = {},
): { userId: string; accountId: string } {
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

  return { userId, accountId }
}
