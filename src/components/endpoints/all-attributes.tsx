import { humanize } from "@/lib/utils"
import { endpointAttributeTypeSchema } from "@/lib/endpoints"

import { Endpoint } from "@/types/endpoints"

import AttributeGroup from "@/components/endpoints/attribute-group"

type Key = keyof typeof endpointAttributeTypeSchema

interface AllAttributesProps {
  endpoint: Endpoint
  className?: string
}

export default function AllAttributes({
  endpoint,
  className,
}: AllAttributesProps): React.ReactElement {
  const keys = (Object.keys(endpointAttributeTypeSchema) as Key[]).sort(
    (a, b) => humanize(a).localeCompare(humanize(b)),
  )

  return (
    <AttributeGroup
      endpoint={endpoint}
      title="Attributes"
      keys={keys}
      className={className}
    />
  )
}
