import { createFileRoute, redirect } from "@tanstack/react-router"

import * as keygen from "@/keygen"
import { restoreSession } from "@/keygen/session"
import {
  loginSearch,
  parseEnvironment,
  redirectTarget,
  takePendingRedirect,
} from "@/lib/auth"

export const Route = createFileRoute("/$accountId/")({
  validateSearch: (search: Record<string, unknown>): { env?: string } => ({
    env: parseEnvironment(search.env),
  }),
  loaderDeps: ({ search }) => ({ env: search.env }),
  beforeLoad: ({ search }) => {
    if (search.env && keygen.config.isSessionAuthenticated) {
      keygen.sessionEnvironment.prime(search.env)
    }
  },
  loader: async ({ params, deps }) => {
    // SSO returns the browser to the slug-addressed account root; resolve the
    // session so we can land on the account's stable id rather than the slug.
    const { userId, accountId } = await restoreSession()

    const pendingRedirect = takePendingRedirect()

    if (!userId) {
      redirect({
        to: "/$accountId/auth/login",
        params: { accountId: params.accountId },
        search: loginSearch({ redirect: pendingRedirect, env: deps.env }),
        replace: true,
        throw: true,
      })
      return
    }

    if (pendingRedirect) {
      redirect({
        ...redirectTarget(pendingRedirect),
        replace: true,
        throw: true,
      })
      return
    }

    redirect({
      to: "/$accountId/app",
      params: { accountId: accountId ?? params.accountId },
      replace: true,
      throw: true,
    })
  },
  component: () => null,
})
