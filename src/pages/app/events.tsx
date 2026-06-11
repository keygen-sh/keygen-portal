import { Outlet, useParams } from "@tanstack/react-router"

import { EventView } from "@/types/events"

import * as Page from "@/pages"
import * as Motion from "@/components/motion"

export default function Events() {
  const { id } = useParams({ strict: false })

  const view = id ? EventView.Details : EventView.List

  const direction: 1 | -1 = view === EventView.Details ? 1 : -1

  const key = view === EventView.List ? "list" : `details-${id}`

  return (
    <Motion.Slide direction={direction}>
      {view === EventView.List ? (
        <Page.App.Event.List key={key} />
      ) : (
        <Outlet key={key} />
      )}
    </Motion.Slide>
  )
}
