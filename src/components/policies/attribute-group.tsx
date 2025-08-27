import { Separator } from "@/components/ui/separator"

import { humanize } from "@/lib/utils"
import { formatPolicyAttribute } from "@/lib/policies"

import { Policy } from "@/types/policies"

import * as Attribute from "@/components/attribute"
import TooltipBadge from "@/components/tooltip-badge"
import CollapsibleCard from "@/components/collapsible-card"

type AttributeGroupProps = {
  policy: Policy
  title: string
  keys: readonly (keyof Policy["attributes"])[]
  when?: (policy: Policy) => boolean
  className?: string
}

export default function AttributeGroup({
  policy,
  title,
  keys,
  when,
  className,
}: AttributeGroupProps) {
  if (when && !when(policy)) return null
  const selected = keys as (keyof Policy["attributes"])[]
  if (selected.length === 0) return null

  const middle = Math.ceil(selected.length / 2)
  const left = selected.slice(0, middle)
  const right = selected.slice(middle)

  const renderColumn = (
    column: (keyof Policy["attributes"])[],
    side: "left" | "right",
  ) => (
    <div className="flex-1 space-y-4">
      {column.map((key) => {
        const { value, variant, tooltip } = formatPolicyAttribute(
          key,
          policy.attributes[key],
        )
        return (
          <Attribute.Field
            key={`${String(key)}-${side}`}
            label={humanize(String(key))}
            variant="none"
            value={
              <TooltipBadge
                value={value}
                variant={variant}
                tooltip={tooltip!}
              />
            }
          />
        )
      })}
    </div>
  )

  return (
    <CollapsibleCard title={title} contentClass={className}>
      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0">
        {renderColumn(left, "left")}
        <div className="mx-4 hidden md:block">
          <Separator orientation="vertical" dashed />
        </div>
        {renderColumn(right, "right")}
      </div>
    </CollapsibleCard>
  )
}
