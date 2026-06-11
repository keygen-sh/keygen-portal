import { Outlet, useParams } from "@tanstack/react-router"

import { WebhookEventView } from "@/types/webhook-events"

import * as Page from "@/pages"
import * as Motion from "@/components/motion"

export default function WebhookEvents() {
  const { id } = useParams({ strict: false })

  const view = id ? WebhookEventView.Details : WebhookEventView.List

  const direction: 1 | -1 = view === WebhookEventView.Details ? 1 : -1

  const key = view === WebhookEventView.List ? "list" : `details-${id}`

  return (
    <Motion.Slide direction={direction}>
      {view === WebhookEventView.List ? (
        <Page.App.WebhookEvent.List key={key} />
      ) : (
        <Outlet key={key} />
      )}
    </Motion.Slide>
  )
}
