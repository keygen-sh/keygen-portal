import { humanize } from "@/lib/utils"
import { endpointAttributeTypeSchema } from "@/lib/endpoints"
import { Endpoint, EndpointAttributeDescriptions } from "@/types/endpoints"
import * as Attribute from "@/components/attribute"
import CollapsibleCard from "@/components/collapsible-card"

type Key = keyof typeof endpointAttributeTypeSchema

type AttributeGroupProps = {
  endpoint: Endpoint
  title: string
  keys: readonly Key[]
  when?: (endpoint: Endpoint) => boolean
  className?: string
}

export default function AttributeGroup({
  endpoint,
  title,
  keys,
  when,
  className,
}: AttributeGroupProps): React.ReactElement | null {
  if (when && !when(endpoint)) return null
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
          type={endpointAttributeTypeSchema[k]}
          value={endpoint.attributes[k] as string | number | boolean | null}
          tooltip={
            (EndpointAttributeDescriptions as Record<Key, string | undefined>)[
              k
            ]
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
