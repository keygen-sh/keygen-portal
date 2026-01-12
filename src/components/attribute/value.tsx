import { formatDuration, formatDate } from "date-fns"

import TooltipBadge from "@/components/tooltip-badge"

import { truncateKey } from "@/lib/licenses"
import { cn, secondsToParts, labelize } from "@/lib/utils"

import { useMobile } from "@/hooks/use-mobile"

export type AttributeType =
  | "duration"
  | "boolean"
  | "string"
  | "number"
  | "code"
  | "json"
  | "enum"
  | "license-key"
  | "date"

type AttributeValueProps = {
  type: AttributeType
  value: string | number | boolean | null
  tooltip?: string
  emptyLabel?: string
  forceDisabled?: boolean
  className?: string
}

export default function AttributeValue({
  type,
  value: raw,
  tooltip,
  emptyLabel = "Not set",
  forceDisabled,
  className,
}: AttributeValueProps): React.ReactElement {
  const isMobile = useMobile()

  const isUnset = raw === null || raw === ""

  if (type === "json") {
    if (isUnset) {
      return (
        <TooltipBadge
          value={emptyLabel}
          variant="disabled"
          tooltip={tooltip!}
        />
      )
    }

    const formatted = JSON.stringify(raw, null, 2)

    return (
      <pre
        className={cn(
          "max-h-64 overflow-auto rounded border p-3 font-mono text-xs whitespace-pre-wrap",
          className,
        )}
      >
        {formatted}
      </pre>
    )
  }

  let value: string

  switch (type) {
    case "duration": {
      const parts = secondsToParts(Number(raw))
      value = parts == null ? "Not set" : formatDuration(parts, { zero: false })
      break
    }
    case "boolean": {
      const bool = Boolean(raw)
      value = isUnset ? emptyLabel : bool ? "Enabled" : "Disabled"
      break
    }
    case "enum":
    case "string":
      value = isUnset ? emptyLabel : labelize(String(raw))
      break
    case "license-key":
      value = isUnset
        ? emptyLabel
        : truncateKey(String(raw), { maxLength: isMobile ? 16 : 24 })
      break
    case "date":
      value = isUnset
        ? emptyLabel
        : formatDate(new Date(String(raw)), "PPp")
      break
    case "code":
    case "number":
    default:
      value = isUnset ? emptyLabel : String(raw)
      break
  }

  const variant: "default" | "success" | "disabled" = forceDisabled
    ? "disabled"
    : type === "boolean"
      ? raw
        ? "success"
        : "disabled"
      : isUnset
        ? "disabled"
        : "default"

  return (
    <TooltipBadge
      value={value}
      variant={variant}
      tooltip={tooltip!}
      className={className}
    />
  )
}
