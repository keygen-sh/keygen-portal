import { humanize } from "@/lib/utils"
import { machineAttributeTypeSchema } from "@/lib/machines"

import { Machine } from "@/types/machines"

import AttributeGroup from "@/components/machines/attribute-group"

type Key = keyof typeof machineAttributeTypeSchema

interface AllAttributesProps {
  machine: Machine
  className?: string
}

export default function AllAttributes({
  machine,
  className,
}: AllAttributesProps): React.ReactElement {
  const keys = (Object.keys(machineAttributeTypeSchema) as Key[]).sort((a, b) =>
    humanize(a).localeCompare(humanize(b)),
  )

  return (
    <AttributeGroup
      machine={machine}
      title="Attributes"
      keys={keys}
      className={className}
    />
  )
}
