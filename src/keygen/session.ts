import client from "@/keygen/client"
import config from "@/keygen/config"
import * as profiles from "@/keygen/profiles"
import { verify } from "@/keygen/verify"

type RestoredSession = {
  userId: string | null
}

let restorePromise: Promise<RestoredSession> | null = null

export async function restoreSession(): Promise<RestoredSession> {
  if (client.currentUser != null) return { userId: client.currentUser }
  if (restorePromise) return restorePromise

  restorePromise = attemptRestoreSession().finally(() => {
    restorePromise = null
  })

  return restorePromise
}

async function attemptRestoreSession(): Promise<RestoredSession> {
  if (!config.id) return { userId: null }

  const token = localStorage.getItem("token") ?? sessionStorage.getItem("token")
  const tokenId =
    localStorage.getItem("tokenId") ?? sessionStorage.getItem("tokenId")

  if (!config.isCloud && token && tokenId) {
    const { data } = await verify({ token, tokenId })

    if (data) {
      const userId = data.relationships.bearer?.data?.id ?? null

      client.setRootToken(token)
      client.setTokenId(tokenId)
      client.setUser(userId)

      return { userId }
    }
  }

  const me = (await profiles.me()) as {
    data?: { id: string }
    included?: { type: string; id: string }[]
  }

  if (me.data) {
    const t = me.included?.find((r) => r.type === "tokens")

    client.setTokenId(t?.id ?? tokenId ?? null)
    client.setUser(me.data.id)

    return { userId: me.data.id }
  }

  return { userId: null }
}
