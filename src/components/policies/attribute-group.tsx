import { humanize } from "@/lib/utils"
import { policyAttributeTypeSchema } from "@/lib/policies"
import { Policy, PolicyAttributeDescriptions } from "@/types/policies"
import * as Attribute from "@/components/attribute"
import CollapsibleCard from "@/components/collapsible-card"

type Key = keyof typeof policyAttributeTypeSchema

type AttributeGroupProps = {
  policy: Policy
  title: string
  keys: readonly Key[]
  when?: (policy: Policy) => boolean
  className?: string
}

export default function AttributeGroup({
  policy,
  title,
  keys,
  when,
  className,
}: AttributeGroupProps): React.ReactElement | null {
  if (when && !when(policy)) return null
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
          type={policyAttributeTypeSchema[k]}
          value={policy.attributes[k]}
          tooltip={
            (PolicyAttributeDescriptions as Record<Key, string | undefined>)[k]
          }
        />
      }
    />
  )

  return (
    <CollapsibleCard title={title} contentClass={className}>
      <div className="md:grid md:grid-cols-2 md:gap-x-6 md:divide-x md:divide-dashed">
        <div className="space-y-4 md:pr-3">{left.map(row)}</div>
        <div className="space-y-4 md:pl-3">{right.map(row)}</div>
      </div>
    </CollapsibleCard>
  )
}
