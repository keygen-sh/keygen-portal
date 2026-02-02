import { Outlet, useParams } from "@tanstack/react-router"

import { GroupView } from "@/types/groups"

import * as Motion from "@/components/motion"
import * as Page from "@/pages"

export default function Groups() {
  const { id } = useParams({ strict: false })

  const view = id ? GroupView.Details : GroupView.List

  const direction: 1 | -1 = view === GroupView.Details ? 1 : -1

  const key = view === GroupView.List ? "list" : `details-${id}`

  return (
    <Motion.Slide direction={direction}>
      {view === GroupView.List ? (
        <Page.App.Group.List key={key} />
      ) : (
        <Outlet key={key} />
      )}
    </Motion.Slide>
  )
}
