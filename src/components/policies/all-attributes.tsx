import { Separator } from "@/components/ui/separator"
import { cn, humanize } from "@/lib/utils"
import { formatPolicyAttribute } from "@/lib/policies"
import { type Policy } from "@/types/policies"
import * as Attribute from "@/components/attribute"
import TooltipBadge from "@/components/tooltip-badge"

interface AllAttributesProps {
  policy: Policy
  className?: string
}

export default function AllAttributes({
  policy,
  className,
}: AllAttributesProps) {
  const exclude: (keyof Policy["attributes"])[] = [
    "metadata",
    "created",
    "updated",
  ]

  const rows = (
    Object.keys(policy.attributes) as (keyof Policy["attributes"])[]
  )
    .filter((key) => !exclude.includes(key))
    .map((key) => {
      const { value, variant, tooltip } = formatPolicyAttribute(
        key,
        policy.attributes[key],
      )
      return {
        key: String(key),
        label: humanize(String(key)),
        value,
        variant,
        tooltip,
      }
    })
    .sort((a, b) => a.label.localeCompare(b.label))

  const middle = Math.ceil(rows.length / 2)
  const left = rows.slice(0, middle)
  const right = rows.slice(middle)

  return (
    <div
      className={cn(
        "flex flex-col space-y-4 md:flex-row md:space-y-0",
        className,
      )}
    >
      <div className="flex-1 space-y-4">
        {left.map((row) => (
          <Attribute.Field
            key={row.key}
            label={row.label}
            variant="none"
            value={
              <TooltipBadge
                value={row.value}
                variant={row.variant}
                tooltip={row.tooltip!}
              />
            }
          />
        ))}
      </div>
      <div className="mx-4 hidden md:block">
        <Separator orientation="vertical" dashed />
      </div>
      <div className="flex-1 space-y-4">
        {right.map((row) => (
          <Attribute.Field
            key={row.key}
            label={row.label}
            variant="none"
            value={
              <TooltipBadge
                value={row.value}
                variant={row.variant}
                tooltip={row.tooltip!}
              />
            }
          />
        ))}
      </div>
    </div>
  )
}
