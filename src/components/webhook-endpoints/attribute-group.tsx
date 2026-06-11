import { humanize } from "@/lib/utils"
import { webhookEndpointAttributeTypeSchema } from "@/lib/webhook-endpoints"
import {
  WebhookEndpoint,
  WebhookEndpointAttributeDescriptions,
} from "@/types/webhook-endpoints"
import * as Attribute from "@/components/attribute"
import CollapsibleCard from "@/components/collapsible-card"

type Key = keyof typeof webhookEndpointAttributeTypeSchema

type AttributeGroupProps = {
  webhookEndpoint: WebhookEndpoint
  title: string
  keys: readonly Key[]
  when?: (webhookEndpoint: WebhookEndpoint) => boolean
  className?: string
}

export default function AttributeGroup({
  webhookEndpoint,
  title,
  keys,
  when,
  className,
}: AttributeGroupProps): React.ReactElement | null {
  if (when && !when(webhookEndpoint)) return null
  if (keys.length === 0) return null

  const middle = Math.ceil(keys.length / 2)
  const left = keys.slice(0, middle)
  const right = keys.slice(middle)

  const row = (k: Key) => (
    <Attribute.Field
      key={k}
      label={humanize(k)}
      variant="none"
      value={
        <Attribute.Value
          type={webhookEndpointAttributeTypeSchema[k]}
          value={
            webhookEndpoint.attributes[k] as string | number | boolean | null
          }
          tooltip={
            (
              WebhookEndpointAttributeDescriptions as Record<
                Key,
                string | undefined
              >
            )[k]
          }
        />
      }
    />
  )

  return (
    <CollapsibleCard title={title} contentClass={className}>
      <div className="md:grid md:grid-cols-2 md:gap-x-6 md:divide-x md:divide-dashed">
        <div className="space-y-4 md:pr-3">{left.map(row)}</div>
        <div className="mt-4 space-y-4 md:mt-0 md:pl-3">{right.map(row)}</div>
      </div>
    </CollapsibleCard>
  )
}
