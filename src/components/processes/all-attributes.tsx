import { humanize } from "@/lib/utils"
import { processAttributeTypeSchema } from "@/lib/processes"

import { Process } from "@/types/processes"

import AttributeGroup from "@/components/processes/attribute-group"

type Key = keyof typeof processAttributeTypeSchema

interface AllAttributesProps {
  process: Process
  className?: string
}

export default function AllAttributes({
  process,
  className,
}: AllAttributesProps): React.ReactElement {
  const keys = (Object.keys(processAttributeTypeSchema) as Key[]).sort((a, b) =>
    humanize(a).localeCompare(humanize(b)),
  )

  return (
    <AttributeGroup
      process={process}
      title="Attributes"
      keys={keys}
      className={className}
    />
  )
}
