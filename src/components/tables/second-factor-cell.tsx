import { Badge } from "@/components/ui/badge"

import { useGetSecondFactor } from "@/queries/second-factors"

import ResourceCell from "./resource-cell"

interface SecondFactorCellProps {
  userId: string | undefined
}

export default function SecondFactorCell({
  userId,
}: SecondFactorCellProps): React.ReactElement {
  if (!userId) return <ResourceCell isEmpty />
  return <SecondFactorCellContent userId={userId} />
}

function SecondFactorCellContent({
  userId,
}: {
  userId: string
}): React.ReactElement {
  const { data: secondFactors, isLoading, isError } = useGetSecondFactor(userId)

  if (isError) {
    return <Badge variant="disabled">Unknown</Badge>
  }

  const enabled = secondFactors?.some((sf) => sf.attributes.enabled) ?? false

  return (
    <ResourceCell isEmpty={!secondFactors} isLoading={isLoading}>
      <Badge variant={enabled ? "success" : "warning"}>
        {enabled ? "Enabled" : "Disabled"}
      </Badge>
    </ResourceCell>
  )
}
