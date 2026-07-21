import { createFileRoute, Navigate } from "@tanstack/react-router"

import { useCloud } from "@/hooks/use-cloud"

import * as keygen from "@/keygen"
import * as Page from "@/pages/index"
import { titleHead } from "@/lib/document-title"
import { requirePermission } from "@/lib/permissions"

function BillingRoute() {
  const { isCloud } = useCloud()

  if (!isCloud) {
    return (
      <Navigate
        to="/$accountId/app/general"
        params={{ accountId: keygen.config.id }}
        replace
      />
    )
  }

  return <Page.App.Settings.Billing />
}

export const Route = createFileRoute("/$accountId/app/billing")({
  head: titleHead("Billing"),
  component: BillingRoute,
  beforeLoad: ({ context }) =>
    requirePermission(context.queryClient, "account.billing.read"),
})
