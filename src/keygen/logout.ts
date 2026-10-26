import client from "@/keygen/client"
import config from "@/keygen/config"
import * as activeEnvironment from "@/keygen/active-environment"
import * as rootEnvironment from "@/keygen/root-environment"
import * as tokens from "@/keygen/tokens"

const STORAGE_KEYS = config.isSessionAuthenticated
  ? ["tokenId"]
  : ["token", "tokenId"]

export async function logout() {
  const tokenId = client.currentTokenId

  if (tokenId) {
    try {
      await tokens.revoke({ id: tokenId })
    } catch (error) {
      console.error("Failed to revoke token on logout", error)
    }
  }

  client.setRootToken(null)
  client.setUser(null)
  client.setTokenId(null)
  activeEnvironment.clear()
  rootEnvironment.clear()

  for (const key of STORAGE_KEYS) {
    localStorage.removeItem(key)
    sessionStorage.removeItem(key)
  }
}
