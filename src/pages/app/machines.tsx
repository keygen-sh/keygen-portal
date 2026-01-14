import { Outlet, useParams } from "@tanstack/react-router"

import { MachineView } from "@/types/machines"

import * as Motion from "@/components/motion"
import * as Page from "@/pages"

export default function Machines() {
  const { machineId } = useParams({ strict: false })

  const view = machineId ? MachineView.Details : MachineView.List

  const direction: 1 | -1 = view === MachineView.Details ? 1 : -1

  const key = view === MachineView.List ? "list" : `details-${machineId}`

  return (
    <Motion.Slide direction={direction}>
      {view === MachineView.List ? (
        <Page.App.Machine.List key={key} />
      ) : (
        <Outlet key={key} />
      )}
    </Motion.Slide>
  )
}
