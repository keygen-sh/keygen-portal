import { humanize } from "@/lib/utils"
import { eventAttributeTypeSchema } from "@/lib/events"

import { Event } from "@/types/events"

import AttributeGroup from "@/components/events/attribute-group"

type Key = keyof typeof eventAttributeTypeSchema

interface AllAttributesProps {
  event: Event
  className?: string
}

export default function AllAttributes({
  event,
  className,
}: AllAttributesProps): React.ReactElement {
  const keys = (Object.keys(eventAttributeTypeSchema) as Key[]).sort((a, b) =>
    humanize(a).localeCompare(humanize(b)),
  )

  return (
    <AttributeGroup
      event={event}
      title="Attributes"
      keys={keys}
      className={className}
    />
  )
}
