import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"

import { cn } from "@/lib/utils"
import {
  BYTE_UNITS,
  type ByteUnit,
  selectByteUnit,
  type ByteUnitKey,
  formatByteUnitValue,
} from "@/lib/bytes"

import NumberInput from "@/components/number-input"

interface ByteSizeInputProps
  extends Pick<
    React.ComponentProps<"input">,
    "id" | "aria-invalid" | "aria-describedby" | "ref"
  > {
  value?: number | null
  onChange: (bytes: number | null) => void
  defaultUnit?: ByteUnitKey
  placeholder?: string
  placeholderBytes?: number | null
  autoFocus?: boolean
  className?: string
}

export default function ByteSizeInput({
  value,
  onChange,
  defaultUnit = "GB",
  placeholder,
  placeholderBytes,
  autoFocus,
  className,
  ...inputProps
}: ByteSizeInputProps): React.ReactElement {
  const [unit, setUnit] = useState<ByteUnit>(() =>
    selectByteUnit(value, defaultUnit),
  )
  const [unitsOpen, setUnitsOpen] = useState(false)

  const apply = (n: number | null, u: ByteUnit) => {
    if (n != null && Number.isNaN(n)) onChange(NaN)
    else if (n == null || n <= 0) onChange(null)
    else onChange(Math.round(n * u.bytes))
  }

  const onNumberChange = (next: number | null) => {
    apply(next, unit)
  }

  const onUnitChange = (u: ByteUnit) => {
    setUnit(u)
    setUnitsOpen(false)
  }

  const valueInUnit =
    value == null
      ? null
      : Number.isNaN(value)
        ? NaN
        : Number((value / unit.bytes).toFixed(2))
  const placeholderInUnit =
    placeholderBytes === undefined
      ? placeholder
      : placeholderBytes === null
        ? "Unlimited"
        : formatByteUnitValue(placeholderBytes, unit)

  return (
    <div className={cn("flex items-stretch", className)}>
      <NumberInput
        {...inputProps}
        decimal={unit.bytes !== 1}
        value={valueInUnit}
        placeholder={placeholderInUnit}
        onChange={onNumberChange}
        autoFocus={autoFocus}
        className="rounded-r-none"
      />

      <Popover open={unitsOpen} onOpenChange={setUnitsOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="rounded-l-none border-l-0 bg-background-1 text-content-muted"
          >
            {unit.key}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-24 p-1">
          <ul className="h-fit">
            {BYTE_UNITS.map((u) => (
              <li key={u.key}>
                <button
                  type="button"
                  className={cn(
                    "w-full rounded px-2 py-1 text-left hover:bg-accent",
                    u.key === unit.key && "bg-accent",
                  )}
                  onClick={() => onUnitChange(u)}
                >
                  {u.label}
                </button>
              </li>
            ))}
          </ul>
        </PopoverContent>
      </Popover>
    </div>
  )
}
