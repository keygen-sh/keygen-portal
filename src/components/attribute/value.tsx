import { formatDuration } from "date-fns"

import TooltipBadge from "@/components/tooltip-badge"

import { secondsToParts, labelize } from "@/lib/utils"

export type AttributeType =
  | "duration"
  | "boolean"
  | "string"
  | "number"
  | "code"
  | "json"
  | "enum"

type AttributeValueProps = {
  type: AttributeType
  value: unknown
  tooltip?: string
  emptyLabel?: string
  forceDisabled?: boolean
}

export default function AttributeValue({
  type,
  value: raw,
  tooltip,
  emptyLabel = "Not set",
  forceDisabled,
}: AttributeValueProps): React.ReactElement {
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
      <pre className="max-h-64 overflow-auto rounded border p-3 font-mono text-xs whitespace-pre-wrap">
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
      value = isUnset ? emptyLabel : labelize(JSON.stringify(raw))
      break
    case "code":
      value = isUnset ? emptyLabel : JSON.stringify(raw)
      break
    case "number":
      value = isUnset ? emptyLabel : JSON.stringify(raw)
      break
    case "string":
    default:
      value = isUnset ? emptyLabel : labelize(JSON.stringify(raw))
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

  return <TooltipBadge value={value} variant={variant} tooltip={tooltip!} />
}
