import { Outlet, useParams } from "@tanstack/react-router"

import { EventLogView } from "@/types/event-logs"

import * as Motion from "@/components/motion"
import * as Page from "@/pages"

export default function EventLogs() {
  const { id } = useParams({ strict: false })

  const view = id ? EventLogView.Details : EventLogView.List

  const direction: 1 | -1 = view === EventLogView.Details ? 1 : -1

  const key = view === EventLogView.List ? "list" : `details-${id}`

  return (
    <Motion.Slide direction={direction}>
      {view === EventLogView.List ? (
        <Page.App.EventLog.List key={key} />
      ) : (
        <Outlet key={key} />
      )}
    </Motion.Slide>
  )
}
