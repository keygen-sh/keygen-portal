import { Outlet, useParams } from "@tanstack/react-router"

import { LicenseView } from "@/types/licenses"

import * as Motion from "@/components/motion"
import * as Page from "@/pages"

export default function Licenses() {
  const { licenseId } = useParams({ strict: false })

  const view = licenseId ? LicenseView.Details : LicenseView.List

  const direction: 1 | -1 = view === LicenseView.Details ? 1 : -1

  const key = view === LicenseView.List ? "list" : `details-${licenseId}`

  return (
    <Motion.Slide direction={direction}>
      {view === LicenseView.List ? (
        <Page.App.License.List key={key} />
      ) : (
        <Outlet key={key} />
      )}
    </Motion.Slide>
  )
}
