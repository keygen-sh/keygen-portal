import { createFileRoute, redirect } from "@tanstack/react-router"

import * as keygen from "@/keygen"
import { restoreSession } from "@/keygen/session"
import { getRecentAccounts } from "@/lib/accounts"

export const Route = createFileRoute("/goto/$")({
  loader: async ({ params, location }) => {
    const accountId = keygen.config.hasFixedAccount
      ? keygen.config.id
      : (keygen.client.currentAccount ?? getRecentAccounts()[0]?.id)

    if (!accountId) {
      redirect({
        to: "/auth",
        search: { redirect: location.href },
        replace: true,
        throw: true,
      })
      return
    }

    keygen.config.setAccountId(accountId)

    const session = await restoreSession().catch((error: unknown) => {
      console.error(error)
      return null
    })

    if (!session?.userId) {
      redirect({
        to: "/$accountId/auth/login",
        params: { accountId },
        search: { redirect: location.href },
        replace: true,
        throw: true,
      })
      return
    }

    redirect({
      to: `/$accountId/app/${params._splat ?? ""}`,
      params: { accountId: session.accountId ?? accountId },
      search: location.search,
      hash: location.hash,
      replace: true,
      throw: true,
    })
  },
  component: () => null,
})
