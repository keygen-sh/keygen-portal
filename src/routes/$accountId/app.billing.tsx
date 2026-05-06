import { createFileRoute, Navigate } from "@tanstack/react-router"

import { useCloud } from "@/hooks/use-cloud"

import * as keygen from "@/keygen"
import * as Page from "@/pages/index"

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
  component: BillingRoute,
})
