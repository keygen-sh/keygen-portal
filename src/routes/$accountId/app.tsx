import { createFileRoute, redirect } from "@tanstack/react-router"

import * as Layout from "@/layouts/index"
import { restoreSession } from "@/keygen/session"

export const Route = createFileRoute("/$accountId/app")({
  beforeLoad: async ({ params, location }) => {
    const session = await restoreSession().catch((error: unknown) => {
      console.error(error)
      return null
    })

    if (!session?.userId) {
      redirect({
        to: "/$accountId/auth/login",
        params: { accountId: params.accountId },
        search: {
          redirect: location.href.replace(`/${params.accountId}/app`, "/goto"),
        },
        replace: true,
        throw: true,
      })
    }
  },
  component: () => <Layout.App />,
})
