import { humanize } from "@/lib/utils"
import { groupAttributeTypeSchema } from "@/lib/groups"

import { Group } from "@/types/groups"

import AttributeGroup from "@/components/groups/attribute-group"

type Key = keyof typeof groupAttributeTypeSchema

interface AllAttributesProps {
  group: Group
  className?: string
}

export default function AllAttributes({
  group,
  className,
}: AllAttributesProps): React.ReactElement {
  const keys = (Object.keys(groupAttributeTypeSchema) as Key[]).sort((a, b) =>
    humanize(a).localeCompare(humanize(b)),
  )

  return (
    <AttributeGroup
      group={group}
      title="Attributes"
      keys={keys}
      className={className}
    />
  )
}
