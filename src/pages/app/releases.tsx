import { Outlet, useParams } from "@tanstack/react-router"

import { ReleaseView } from "@/types/releases"

import * as Motion from "@/components/motion"
import * as Page from "@/pages"

export default function Releases() {
  const { id } = useParams({ strict: false })

  const view = id ? ReleaseView.Details : ReleaseView.List

  const direction: 1 | -1 = view === ReleaseView.Details ? 1 : -1

  const key = view === ReleaseView.List ? "list" : `details-${id}`

  return (
    <Motion.Slide direction={direction}>
      {view === ReleaseView.List ? (
        <Page.App.Release.List key={key} />
      ) : (
        <Outlet key={key} />
      )}
    </Motion.Slide>
  )
}
