import { Outlet, useParams } from "@tanstack/react-router"

import { RequestLogView } from "@/types/request-logs"

import * as Motion from "@/components/motion"
import * as Page from "@/pages"

export default function RequestLogs() {
  const { id } = useParams({ strict: false })

  const view = id ? RequestLogView.Details : RequestLogView.List

  const direction: 1 | -1 = view === RequestLogView.Details ? 1 : -1

  const key = view === RequestLogView.List ? "list" : `details-${id}`

  return (
    <Motion.Slide direction={direction}>
      {view === RequestLogView.List ? (
        <Page.App.RequestLog.List key={key} />
      ) : (
        <Outlet key={key} />
      )}
    </Motion.Slide>
  )
}
