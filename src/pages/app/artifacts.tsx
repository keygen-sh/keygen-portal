import { Outlet, useParams } from "@tanstack/react-router"

import { ArtifactView } from "@/types/artifacts"

import * as Motion from "@/components/motion"
import * as Page from "@/pages"

export default function Artifacts() {
  const { id } = useParams({ strict: false })

  const view = id ? ArtifactView.Details : ArtifactView.List

  const direction: 1 | -1 = view === ArtifactView.Details ? 1 : -1

  const key = view === ArtifactView.List ? "list" : `details-${id}`

  return (
    <Motion.Slide direction={direction}>
      {view === ArtifactView.List ? (
        <Page.App.Artifact.List key={key} />
      ) : (
        <Outlet key={key} />
      )}
    </Motion.Slide>
  )
}
