import { useState } from "react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"

import { cn } from "@/lib/utils"

const BYTE_UNITS = [
  { key: "B", label: "Bytes", bytes: 1 },
  { key: "KB", label: "KB", bytes: 1024 },
  { key: "MB", label: "MB", bytes: 1024 ** 2 },
  { key: "GB", label: "GB", bytes: 1024 ** 3 },
  { key: "TB", label: "TB", bytes: 1024 ** 4 },
  { key: "PB", label: "PB", bytes: 1024 ** 5 },
] as const

type ByteUnit = (typeof BYTE_UNITS)[number]
type ByteUnitKey = ByteUnit["key"]

function findUnit(key: ByteUnitKey): ByteUnit {
  return BYTE_UNITS.find((u) => u.key === key) ?? BYTE_UNITS[0]
}

function selectUnit(
  bytes?: number | null,
  defaultUnit: ByteUnitKey = "GB",
): ByteUnit {
  if (bytes == null || bytes <= 0) return findUnit(defaultUnit)

  for (let i = BYTE_UNITS.length - 1; i >= 0; i--) {
    if (bytes >= BYTE_UNITS[i].bytes) return BYTE_UNITS[i]
  }

  return BYTE_UNITS[0]
}

function formatUnitValue(bytes: number | null | undefined, unit: ByteUnit) {
  if (bytes == null) return ""

  const value = bytes / unit.bytes
  return Number.isInteger(value)
    ? String(value)
    : String(Number(value.toFixed(2)))
}

interface ByteSizeInputProps {
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
}: ByteSizeInputProps): React.ReactElement {
  const [unit, setUnit] = useState<ByteUnit>(() =>
    selectUnit(value, defaultUnit),
  )
  const [unitsOpen, setUnitsOpen] = useState(false)

  const apply = (n: number | null, u: ByteUnit) => {
    if (n == null || n <= 0) onChange(null)
    else onChange(Math.round(n * u.bytes))
  }

  const onNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.currentTarget.value
    const next = raw === "" ? null : Number(raw)

    apply(next, unit)
  }

  const onUnitChange = (u: ByteUnit) => {
    setUnit(u)
    setUnitsOpen(false)
  }

  const valueInUnit = formatUnitValue(value, unit)
  const placeholderInUnit =
    placeholderBytes === undefined
      ? placeholder
      : placeholderBytes === null
        ? "Unlimited"
        : formatUnitValue(placeholderBytes, unit)

  return (
    <div className={cn("flex items-stretch", className)}>
      <Input
        type="number"
        min={unit.bytes === 1 ? 1 : 0.01}
        step={unit.bytes === 1 ? 1 : "any"}
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
