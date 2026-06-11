import { humanize } from "@/lib/utils"
import { webhookEventAttributeTypeSchema } from "@/lib/webhook-events"

import { WebhookEvent } from "@/types/webhook-events"

import AttributeGroup from "@/components/webhook-events/attribute-group"

type Key = keyof typeof webhookEventAttributeTypeSchema

interface AllAttributesProps {
  webhookEvent: WebhookEvent
  className?: string
}

export default function AllAttributes({
  webhookEvent,
  className,
}: AllAttributesProps): React.ReactElement {
  const keys = (Object.keys(webhookEventAttributeTypeSchema) as Key[]).sort(
    (a, b) => humanize(a).localeCompare(humanize(b)),
  )

  return (
    <AttributeGroup
      webhookEvent={webhookEvent}
      title="Attributes"
      keys={keys}
      className={className}
    />
  )
}
