import { Outlet, useParams } from "@tanstack/react-router"

import { PolicyView } from "@/types/policies"

import * as Motion from "@/components/motion"
import * as Page from "@/pages"

export default function Policies() {
  const { policyId } = useParams({ strict: false })

  const view = policyId ? PolicyView.DETAILS : PolicyView.LIST

  const direction: 1 | -1 = view === PolicyView.DETAILS ? 1 : -1

  const key = view === PolicyView.LIST ? "list" : `details-${policyId}`

  return (
    <Motion.Slide direction={direction}>
      {view === PolicyView.LIST ? (
        <Page.App.Policy.List key={key} />
      ) : (
        <Outlet key={key} />
      )}
    </Motion.Slide>
  )
}
