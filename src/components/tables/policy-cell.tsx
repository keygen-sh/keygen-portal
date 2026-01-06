import { useGetPolicy } from "@/queries/policies"

import ResourceCell from "./resource-cell"

interface PolicyCellProps {
  id: string | undefined
}

export default function PolicyCell({
  id,
}: PolicyCellProps): React.ReactElement {
  if (!id) return <ResourceCell isEmpty />
  return <PolicyCellContent id={id} />
}

function PolicyCellContent({ id }: { id: string }): React.ReactElement {
  const { data, isLoading: policyLoading } = useGetPolicy(id)

  return (
    <ResourceCell isEmpty={!data} isLoading={policyLoading}>
      {data?.attributes.name}
    </ResourceCell>
  )
}
