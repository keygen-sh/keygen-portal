import { useGetMachine } from "@/queries/machines"

import EmptyCell from "./empty-cell"
import ResourceCell from "./resource-cell"

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
  const { data, isLoading: machineLoading } = useGetMachine(id)

  return (
    <ResourceCell isEmpty={!data} isLoading={machineLoading}>
      {data?.attributes.name || <EmptyCell />}
    </ResourceCell>
  )
}
