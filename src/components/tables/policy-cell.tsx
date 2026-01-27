import { useGetPolicy } from "@/queries/policies"

import * as keygen from "@/keygen"

import ResourceCell from "./resource-cell"
import GoToButton from "@/components/go-to-button"

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
  const { data: policy, isLoading: policyLoading } = useGetPolicy(id)

  const label = policy?.attributes.name || "View Policy"

  return (
    <ResourceCell isEmpty={!policy} isLoading={policyLoading}>
      <GoToButton
        path="/$id/app/policies/$policyId"
        params={{ id: keygen.config.id, policyId: id }}
        label={label}
      />
    </ResourceCell>
  )
}
