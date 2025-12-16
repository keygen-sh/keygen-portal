import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"

import { cn } from "@/lib/utils"

const SecondsPerMinute = 60
const SecondsPerHour = 3600
const SecondsPerDay = 86400
const SecondsPerWeek = 604800
const SecondsPerMonth = 2592000
const SecondsPerYear = 31536000

type Unit = { key: string; label: string; seconds: number | null }

const DefaultUnits: Unit[] = [
  { key: "unlimited", label: "Unlimited", seconds: null },
  { key: "seconds", label: "Seconds", seconds: 1 },
  { key: "minutes", label: "Minutes", seconds: SecondsPerMinute },
  { key: "hours", label: "Hours", seconds: SecondsPerHour },
  { key: "days", label: "Days", seconds: SecondsPerDay },
  { key: "weeks", label: "Weeks", seconds: SecondsPerWeek },
  { key: "months", label: "Months", seconds: SecondsPerMonth },
  { key: "years", label: "Years", seconds: SecondsPerYear },
]

type Preset = { label: string; seconds: number | null }

const DefaultPresets: Preset[] = [
  { seconds: null, label: "Unlimited" },

  { seconds: SecondsPerDay * 1, label: "1 Day" },
  { seconds: SecondsPerDay * 2, label: "2 Days" },
  { seconds: SecondsPerDay * 3, label: "3 Days" },
  { seconds: SecondsPerDay * 4, label: "4 Days" },
  { seconds: SecondsPerDay * 5, label: "5 Days" },

  { seconds: SecondsPerWeek * 1, label: "1 Week" },
  { seconds: SecondsPerWeek * 2, label: "2 Weeks" },
  { seconds: SecondsPerWeek * 3, label: "3 Weeks" },
  { seconds: SecondsPerWeek * 4, label: "4 Weeks" },
  { seconds: SecondsPerWeek * 5, label: "5 Weeks" },

  { seconds: SecondsPerMonth * 1, label: "1 Month" },
  { seconds: SecondsPerMonth + SecondsPerDay * 1, label: "31 Days" },
  { seconds: SecondsPerMonth + SecondsPerDay * 2, label: "32 Days" },

  { seconds: SecondsPerMonth * 2, label: "2 Months" },
  { seconds: SecondsPerMonth * 3, label: "3 Months" },
  { seconds: SecondsPerMonth * 4, label: "4 Months" },
  { seconds: SecondsPerMonth * 5, label: "5 Months" },
  { seconds: SecondsPerMonth * 6, label: "6 Months" },
  { seconds: SecondsPerMonth * 9, label: "9 Months" },
  { seconds: SecondsPerMonth * 13, label: "13 Months" },

  { seconds: SecondsPerYear * 1, label: "1 Year" },
  { seconds: SecondsPerYear * 2, label: "2 Years" },
  { seconds: SecondsPerYear * 3, label: "3 Years" },
]

export const HeartbeatPresets: Preset[] = [
  { seconds: SecondsPerMinute * 1, label: "1 Minute" },
  { seconds: SecondsPerMinute * 2, label: "2 Minutes" },
  { seconds: SecondsPerMinute * 5, label: "5 Minutes" },
  { seconds: SecondsPerMinute * 10, label: "10 Minutes" },
  { seconds: SecondsPerMinute * 15, label: "15 Minutes" },
  { seconds: SecondsPerMinute * 30, label: "30 Minutes" },
  { seconds: SecondsPerHour * 1, label: "1 Hour" },
  { seconds: SecondsPerHour * 12, label: "12 Hours" },
  { seconds: SecondsPerDay * 1, label: "1 Day" },
]

function selectUnit(
  totalSeconds?: number | null,
  allowed: Unit[] = DefaultUnits,
): Unit {
  if (totalSeconds == null) {
    const unlimited = allowed.find((u) => u.seconds == null)
    return unlimited ?? allowed[0]
  }

  const seconds =
    typeof totalSeconds === "number" && totalSeconds > 0 ? totalSeconds : 0

  if (seconds === 0) {
    const positive = allowed.find(
      (u) => typeof u.seconds === "number" && u.seconds > 0,
    )
    return positive ?? allowed[0]
  }

  for (let i = allowed.length - 1; i >= 0; i--) {
    const unitSeconds = allowed[i].seconds
    if (
      typeof unitSeconds === "number" &&
      unitSeconds > 0 &&
      seconds % unitSeconds === 0
    ) {
      return allowed[i]
    }
  }

  const positive = allowed.find(
    (u) => typeof u.seconds === "number" && u.seconds > 0,
  )
  return positive ?? allowed[0]
}

interface DurationInputProps {
  value?: number | null
  onChange: (seconds: number | null) => void
  units?: Array<Unit["key"]>
  presets?: Preset[]
  disabled?: boolean
  className?: string
}

export default function DurationInput({
  value,
  onChange,
  units,
  presets,
  disabled,
  className,
}: DurationInputProps): React.ReactElement {
  const availableUnits = useMemo(() => {
    if (!units || units.length === 0) return DefaultUnits
    const allowed = new Set(units)
    const filtered = DefaultUnits.filter((u) => allowed.has(u.key))
    return filtered.length > 0 ? filtered : DefaultUnits
  }, [units])

  const availablePresets = presets ?? DefaultPresets

  const [unit, setUnit] = useState<Unit>(() =>
    selectUnit(value, availableUnits),
  )
  const [num, setNum] = useState<number | null>(() => {
    const selectedUnit = selectUnit(value, availableUnits)
    if (selectedUnit.seconds == null) return null
    if (typeof value === "number" && value > 0)
      return Math.max(1, Math.round(value / selectedUnit.seconds))
    return null
  })
  const [unitsOpen, setUnitsOpen] = useState(false)
  const [presetsOpen, setPresetsOpen] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)

  const selectPreset = (seconds: number | null) => {
    const selectedUnit = selectUnit(seconds, availableUnits)
    setUnit(selectedUnit)
    setNum(
      seconds == null || selectedUnit.seconds == null
        ? null
        : Math.max(1, Math.round(seconds / selectedUnit.seconds)),
    )
    setPresetsOpen(false)
    onChange(seconds)
  }

  useEffect(() => {
    // recalculate num based on current unit, but preserve the unit
    if (value != null && value > 0 && unit.seconds != null) {
      setNum(Math.max(1, Math.round(value / unit.seconds)))
    } else {
      setNum(null)
    }
  }, [value, unit])

  const apply = useCallback(
    (n: number | null, u: Unit) => {
      if (n == null || u.seconds == null) onChange(null)
      else onChange(n > 0 ? n * u.seconds : null)
    },
    [onChange],
  )

  const onNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.currentTarget.value
    const next = raw === "" ? null : Number(raw)
    setNum(next)

    // Switch to a default unit if current unit is unlimited
    if (unit.seconds == null && next != null) {
      const defaultUnit =
        availableUnits.find((u) => u.key === "days") ??
        availableUnits.find((u) => u.seconds != null) ??
        availableUnits[0]
      setUnit(defaultUnit)
      apply(next, defaultUnit)
    } else {
      apply(next, unit)
    }
  }

  const onUnitChange = (u: Unit) => {
    setUnit(u)
    setUnitsOpen(false)
    apply(num, u)
  }

  const isUnlimited = unit.seconds == null

  return (
    <div className={cn("flex items-stretch", className)}>
      <Popover open={presetsOpen} onOpenChange={setPresetsOpen}>
        <PopoverPrimitive.Anchor asChild>
          <Input
            ref={inputRef}
            type="number"
            min={1}
            step={1}
            value={isUnlimited || num == null ? "" : num}
            onFocus={() => setPresetsOpen(true)}
            onChange={onNumberChange}
            disabled={disabled}
            className="rounded-r-none"
          />
        </PopoverPrimitive.Anchor>

        {availablePresets.length > 0 && (
          <PopoverContent
            align="start"
            className="w-40 p-1"
            onOpenAutoFocus={(e) => e.preventDefault()}
            onCloseAutoFocus={(e) => e.preventDefault()}
            onInteractOutside={(e) => {
              const target = e.target as Node
              if (inputRef.current && inputRef.current.contains(target)) {
                e.preventDefault()
              }
            }}
          >
            <ScrollArea type="always" className="h-64">
              <label className="ml-1 font-owners-text text-sm font-medium text-content-subdued">
                Presets
              </label>
              <ul>
                {availablePresets.map((p) => (
                  <li key={p.label}>
                    <button
                      type="button"
                      className="w-full rounded px-2 py-1 text-left hover:bg-accent"
                      onClick={() => selectPreset(p.seconds)}
                    >
                      {p.label}
                    </button>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </PopoverContent>
        )}
      </Popover>

      <Popover open={unitsOpen} onOpenChange={setUnitsOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className="rounded-l-none border-l-0 bg-background-1 text-content-muted"
          >
            {unit.label}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-32 p-1">
          <ul className="h-fit">
            {availableUnits.map((u) => (
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
