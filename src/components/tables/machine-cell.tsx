// TODO(cazden) Add machines query
// import { useGetMachine } from "@/queries/machines"

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
  // const { data, isLoading: machineLoading } = useGetMachine(id)

  void id
  const data = { attributes: { name: "--" } }
  const machineLoading = false

  return (
    <ResourceCell isEmpty={!data} isLoading={machineLoading}>
      {data?.attributes.name}
    </ResourceCell>
  )
}
