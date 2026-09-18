import { createFileRoute, redirect } from "@tanstack/react-router"

import { restoreSession } from "@/keygen/session"
import { redirectTarget, takePendingRedirect } from "@/lib/auth"

export const Route = createFileRoute("/$accountId/")({
  loader: async ({ params }) => {
    // SSO returns the browser to the slug-addressed account root; resolve the
    // session so we can land on the account's stable id rather than the slug.
    const { accountId } = await restoreSession()

    const pendingRedirect = takePendingRedirect()
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
