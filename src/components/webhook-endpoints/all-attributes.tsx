import { humanize } from "@/lib/utils"
import { webhookEndpointAttributeTypeSchema } from "@/lib/webhook-endpoints"

import { WebhookEndpoint } from "@/types/webhook-endpoints"

import AttributeGroup from "@/components/webhook-endpoints/attribute-group"

type Key = keyof typeof webhookEndpointAttributeTypeSchema

interface AllAttributesProps {
  webhookEndpoint: WebhookEndpoint
  className?: string
}

export default function AllAttributes({
  webhookEndpoint,
  className,
}: AllAttributesProps): React.ReactElement {
  const keys = (Object.keys(webhookEndpointAttributeTypeSchema) as Key[]).sort(
    (a, b) => humanize(a).localeCompare(humanize(b)),
  )

  return (
    <AttributeGroup
      webhookEndpoint={webhookEndpoint}
      title="Attributes"
      keys={keys}
      className={className}
    />
  )
}
