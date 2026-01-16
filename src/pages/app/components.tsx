import { Outlet, useParams } from "@tanstack/react-router"

import { ComponentView } from "@/types/components"

import * as Motion from "@/components/motion"
import * as Page from "@/pages"

export default function Components() {
  const { componentId } = useParams({ strict: false })

  const view = componentId ? ComponentView.Details : ComponentView.List

  const direction: 1 | -1 = view === ComponentView.Details ? 1 : -1

  const key = view === ComponentView.List ? "list" : `details-${componentId}`

  return (
    <Motion.Slide direction={direction}>
      {view === ComponentView.List ? (
        <Page.App.Component.List key={key} />
      ) : (
        <Outlet key={key} />
      )}
    </Motion.Slide>
  )
}
