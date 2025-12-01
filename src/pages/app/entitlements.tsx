import { Outlet, useParams } from "@tanstack/react-router"

import { EntitlementView } from "@/types/entitlements"

import * as Motion from "@/components/motion"
import * as Page from "@/pages"

export default function Entitlements() {
  const { entitlementId } = useParams({ strict: false })

  const view = entitlementId ? EntitlementView.Details : EntitlementView.List

  const direction: 1 | -1 = view === EntitlementView.Details ? 1 : -1

  const key =
    view === EntitlementView.List ? "list" : `details-${entitlementId}`

  return (
    <Motion.Slide direction={direction}>
      {view === EntitlementView.List ? (
        <Page.App.Entitlement.List key={key} />
      ) : (
        <Outlet key={key} />
      )}
    </Motion.Slide>
  )
}
