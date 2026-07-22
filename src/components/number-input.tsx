import * as React from "react"

import { Input } from "@/components/ui/input"

// convert a number or null into a raw string
function toRawString(value: number | null | undefined): string {
  return value == null || Number.isNaN(value) ? "" : String(value)
}

// parse a raw string into a number or null
function parseRaw(raw: string): number | null {
  const trimmed = raw.trim()
  return trimmed === "" ? null : Number(trimmed)
}

type NumberInputProps = Omit<
  React.ComponentProps<typeof Input>,
  "type" | "value" | "onChange" | "inputMode"
> & {
  value?: number | null
  onChange?: (value: number | null) => void
  decimal?: boolean
}

export default function NumberInput({
  value = null,
  onChange,
  decimal = false,
  ...props
}: NumberInputProps) {
  const [raw, setRaw] = React.useState(() => toRawString(value))

  const incomingIsNaN = typeof value === "number" && Number.isNaN(value)
  if (!incomingIsNaN && !Object.is(parseRaw(raw), value)) {
    setRaw(toRawString(value))
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value
    setRaw(next)
    onChange?.(parseRaw(next))
  }

  return (
    <Input
      {...props}
      type="text"
      inputMode={decimal ? "decimal" : "numeric"}
      value={raw}
      onChange={handleChange}
    />
  )
}
