import client from "@/keygen/client"
import config from "@/keygen/config"
import * as profiles from "@/keygen/profiles"
import * as sessionEnvironment from "@/keygen/session-environment"
import { verify } from "@/keygen/verify"

type RestoredSession = {
  userId: string | null
  accountId: string | null
}

let restorePromise: Promise<RestoredSession> | null = null

export async function restoreSession(): Promise<RestoredSession> {
  if (client.currentUser != null) {
    return {
      userId: client.currentUser,
      accountId: client.currentAccount ?? null,
    }
  }
  if (restorePromise) return restorePromise

  restorePromise = attemptRestoreSession().finally(() => {
    restorePromise = null
  })

  return restorePromise
}

async function attemptRestoreSession(): Promise<RestoredSession> {
  if (!config.id) return { userId: null, accountId: null }

  const token = localStorage.getItem("token") ?? sessionStorage.getItem("token")
  const tokenId =
    localStorage.getItem("tokenId") ?? sessionStorage.getItem("tokenId")

  sessionEnvironment.restore(tokenId)

  if (config.isTokenAuthenticated && token && tokenId) {
    const { data } = await verify({
      token,
      tokenId,
      environment: client.currentSessionEnvironment,
    })

    if (data) {
      const userId = data.relationships.bearer?.data?.id ?? null
      const accountId = data.relationships.account?.data?.id ?? null

      client.setRootToken(token)
      client.setTokenId(tokenId)
      client.setUser(userId)
      client.setAccount(accountId)

      sessionEnvironment.reconcile({
        accountId,
        tokenId,
        environmentId: data.relationships.environment?.data?.id ?? null,
      })

      return { userId, accountId }
    }
  }

  const me = (await profiles.me()) as {
    data?: {
      id: string
      relationships?: { account?: { data?: { id: string } | null } }
    }
    included?: {
      type: string
      id: string
      relationships?: { environment?: { data?: { id: string } | null } }
    }[]
  }

  if (me.data) {
    const t = me.included?.find((r) => r.type === "tokens")
    const accountId = me.data.relationships?.account?.data?.id ?? null

    client.setTokenId(t?.id ?? tokenId ?? null)
    client.setUser(me.data.id)
    client.setAccount(accountId)

    sessionEnvironment.reconcile({
      accountId,
      tokenId: t?.id ?? null,
      environmentId: t
        ? (t.relationships?.environment?.data?.id ?? null)
        : undefined,
    })

    return { userId: me.data.id, accountId }
  }

  sessionEnvironment.clear()

  return { userId: null, accountId: null }
}
