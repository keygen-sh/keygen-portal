import { Outlet, useParams } from "@tanstack/react-router"

import { ProcessView } from "@/types/processes"

import * as Motion from "@/components/motion"
import * as Page from "@/pages"

export default function Processes() {
  const { processId } = useParams({ strict: false })

  const view = processId ? ProcessView.Details : ProcessView.List

  const direction: 1 | -1 = view === ProcessView.Details ? 1 : -1

  const key = view === ProcessView.List ? "list" : `details-${processId}`

  return (
    <Motion.Slide direction={direction}>
      {view === ProcessView.List ? (
        <Page.App.Process.List key={key} />
      ) : (
        <Outlet key={key} />
      )}
    </Motion.Slide>
  )
}
