import { createFileRoute, redirect } from "@tanstack/react-router"

import { restoreSession } from "@/keygen/session"

export const Route = createFileRoute("/$accountId/")({
  loader: async ({ params }) => {
    // SSO returns the browser to the slug-addressed account root. Resolve the
    // session so we can land on the account's stable id rather than the slug.
    const { accountId } = await restoreSession()

    return redirect({
      to: "/$accountId/app/dashboard",
      params: { accountId: accountId ?? params.accountId },
      replace: true,
    })
  },
  component: () => null,
})
