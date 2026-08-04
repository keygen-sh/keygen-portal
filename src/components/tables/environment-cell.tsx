import { useGetEnvironment } from "@/queries/environments"

import ResourceCell from "./resource-cell"

interface EnvironmentCellProps {
  id: string | undefined
}

export default function EnvironmentCell({
  id,
}: EnvironmentCellProps): React.ReactElement {
  if (!id) return <ResourceCell isEmpty />
  return <EnvironmentCellContent id={id} />
}

function EnvironmentCellContent({ id }: { id: string }): React.ReactElement {
  const { data, isLoading: environmentLoading } = useGetEnvironment(id)

  return (
    <ResourceCell isEmpty={!data} isLoading={environmentLoading}>
      {data?.attributes.name}
    </ResourceCell>
  )
}
