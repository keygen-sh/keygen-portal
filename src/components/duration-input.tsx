import { useState, useEffect, useCallback } from "react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"

import { cn } from "@/lib/utils"

type Unit = { key: string; label: string; seconds: number | null }

const Units: Unit[] = [
  { key: "unlimited", label: "Unlimited", seconds: null },
  { key: "seconds", label: "Seconds", seconds: 1 },
  { key: "minutes", label: "Minutes", seconds: 60 },
  { key: "hours", label: "Hours", seconds: 3600 },
  { key: "days", label: "Days", seconds: 86400 },
  { key: "months", label: "Months", seconds: 2592000 },
  { key: "years", label: "Years", seconds: 31536000 },
]

function selectUnit(totalSeconds?: number | null): Unit {
  if (totalSeconds == null) return Units[0]
  const seconds =
    typeof totalSeconds === "number" && totalSeconds > 0 ? totalSeconds : 0

  if (seconds === 0) return Units[4]
  for (let i = Units.length - 1; i >= 0; i--) {
    const s = Units[i].seconds
    if (typeof s === "number" && s > 0 && seconds % s === 0) return Units[i]
  }
  return Units[1]
}

interface DurationInputProps {
  value?: number | null
  onChange: (seconds: number | null) => void
  disabled?: boolean
  className?: string
}

export default function DurationInput({
  value,
  onChange,
  disabled,
  className,
}: DurationInputProps): React.ReactElement {
  const [unit, setUnit] = useState<Unit>(() => selectUnit(value))
  const [num, setNum] = useState<number>(() =>
    typeof value === "number" && value > 0
      ? Math.max(1, Math.round(value / (selectUnit(value).seconds as number)))
      : 14,
  )
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const u = selectUnit(value)
    setUnit(u)

    const n =
      typeof value === "number" && value > 0
        ? Math.max(1, Math.round(value / (u.seconds as number)))
        : 1
    setNum(n)
  }, [value])

  const apply = useCallback(
    (n: number, u: Unit) => {
      if (u.seconds == null) onChange(null)
      else onChange(n > 0 ? n * u.seconds : 0)
    },
    [onChange],
  )

  const onNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.currentTarget.value
    const n = raw === "" ? 0 : Number(raw)

    setNum(n)
    apply(n, unit)
  }

  const onUnitChange = (u: Unit) => {
    setUnit(u)
    setOpen(false)
    apply(num, u)
  }

  const isUnlimited = unit.seconds == null

  return (
    <div className={cn("flex items-stretch", className)}>
      <Input
        type="number"
        min={1}
        step={1}
        value={isUnlimited ? "" : num || ""}
        onChange={onNumberChange}
        disabled={disabled || isUnlimited}
        className="rounded-r-none"
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className="min-w-24 rounded-l-none border-l-0 bg-background-1 text-content-muted"
          >
            {unit.label}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-32 p-1">
          <ul className="max-h-64 overflow-auto">
            {Units.map((u) => (
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
