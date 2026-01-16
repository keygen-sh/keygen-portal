import { humanize } from "@/lib/utils"
import { componentAttributeTypeSchema } from "@/lib/components"

import { Component } from "@/types/components"

import AttributeGroup from "@/components/components/attribute-group"

type Key = keyof typeof componentAttributeTypeSchema

interface AllAttributesProps {
  component: Component
  className?: string
}

export default function AllAttributes({
  component,
  className,
}: AllAttributesProps): React.ReactElement {
  const keys = (Object.keys(componentAttributeTypeSchema) as Key[]).sort(
    (a, b) => humanize(a).localeCompare(humanize(b)),
  )

  return (
    <AttributeGroup
      component={component}
      title="Attributes"
      keys={keys}
      className={className}
    />
  )
}
