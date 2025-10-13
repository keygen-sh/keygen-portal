import { humanize } from "@/lib/utils"
import { policyAttributeTypeSchema } from "@/lib/policies"

import { Policy } from "@/types/policies"

import AttributeGroup from "@/components/policies/attribute-group"

type Key = keyof typeof policyAttributeTypeSchema

interface AllAttributesProps {
  policy: Policy
  className?: string
}

export default function AllAttributes({
  policy,
  className,
}: AllAttributesProps): React.ReactElement {
  const keys = (Object.keys(policyAttributeTypeSchema) as Key[]).sort((a, b) =>
    humanize(a).localeCompare(humanize(b)),
  )

  return (
    <AttributeGroup
      policy={policy}
      title="Attributes"
      keys={keys}
      className={className}
    />
  )
}
