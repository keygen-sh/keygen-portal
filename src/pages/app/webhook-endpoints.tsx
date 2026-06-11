import { Outlet, useParams } from "@tanstack/react-router"

import { WebhookEndpointView } from "@/types/webhook-endpoints"

import * as Page from "@/pages"
import * as Motion from "@/components/motion"

export default function WebhookEndpoints() {
  const { id } = useParams({ strict: false })

  const view = id ? WebhookEndpointView.Details : WebhookEndpointView.List

  const direction: 1 | -1 = view === WebhookEndpointView.Details ? 1 : -1

  const key = view === WebhookEndpointView.List ? "list" : `details-${id}`

  return (
    <Motion.Slide direction={direction}>
      {view === WebhookEndpointView.List ? (
        <Page.App.WebhookEndpoint.List key={key} />
      ) : (
        <Outlet key={key} />
      )}
    </Motion.Slide>
  )
}
