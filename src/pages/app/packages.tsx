import { Outlet, useParams } from "@tanstack/react-router"

import { PackageView } from "@/types/packages"

import * as Motion from "@/components/motion"
import * as Page from "@/pages"

export default function Packages() {
  const { id } = useParams({ strict: false })

  const view = id ? PackageView.Details : PackageView.List

  const direction: 1 | -1 = view === PackageView.Details ? 1 : -1

  const key = view === PackageView.List ? "list" : `details-${id}`

  return (
    <Motion.Slide direction={direction}>
      {view === PackageView.List ? (
        <Page.App.Package.List key={key} />
      ) : (
        <Outlet key={key} />
      )}
    </Motion.Slide>
  )
}
