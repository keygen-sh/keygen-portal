import { Outlet, useParams } from "@tanstack/react-router"

import { EndpointView } from "@/types/endpoints"

import * as Page from "@/pages"
import * as Motion from "@/components/motion"

export default function Endpoints() {
  const { id } = useParams({ strict: false })

  const view = id ? EndpointView.Details : EndpointView.List

  const direction: 1 | -1 = view === EndpointView.Details ? 1 : -1

  const key = view === EndpointView.List ? "list" : `details-${id}`

  return (
    <Motion.Slide direction={direction}>
      {view === EndpointView.List ? (
        <Page.App.Endpoint.List key={key} />
      ) : (
        <Outlet key={key} />
      )}
    </Motion.Slide>
  )
}
