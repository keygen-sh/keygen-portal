import { createFileRoute, redirect } from "@tanstack/react-router"

import * as keygen from "@/keygen"
import * as Page from "@/pages/index"
import { requirePermission } from "@/lib/permissions"

export const Route = createFileRoute("/$accountId/app/permissions")({
  component: () => <Page.App.Settings.Permissions />,
  beforeLoad: ({ context }) => {
    if (keygen.config.isCE) {
      redirect({
        to: "/$accountId/app/general",
        params: { accountId: keygen.config.id },
        replace: true,
        throw: true,
      })
    }

    return requirePermission(context.queryClient, "account.update")
  },
})
