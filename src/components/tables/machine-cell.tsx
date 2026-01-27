import { useGetMachine } from "@/queries/machines"

import * as keygen from "@/keygen"

import ResourceCell from "./resource-cell"
import GoToButton from "@/components/go-to-button"

interface MachineCellProps {
  id: string | undefined
}

export default function MachineCell({
  id,
}: MachineCellProps): React.ReactElement {
  if (!id) return <ResourceCell isEmpty />
  return <MachineCellContent id={id} />
}

function MachineCellContent({ id }: { id: string }): React.ReactElement {
  const { data: machine, isLoading: machineLoading } = useGetMachine(id)

  const label = machine?.attributes.name || "View Machine"

  return (
    <ResourceCell isEmpty={!machine} isLoading={machineLoading}>
      <GoToButton
        path="/$id/app/machines/$machineId"
        params={{ id: keygen.config.id, machineId: id }}
        label={label}
      />
    </ResourceCell>
  )
}
