import { useState, useEffect, useCallback, useRef } from "react"
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

const SecondsPerDay = 86400
const SecondsPerWeek = 604800
const SecondsPerMonth = 2592000
const SecondsPerYear = 31536000

type Unit = { key: string; label: string; seconds: number | null }

const Units: Unit[] = [
  { key: "unlimited", label: "Unlimited", seconds: null },
  { key: "days", label: "Days", seconds: SecondsPerDay },
  { key: "weeks", label: "Weeks", seconds: SecondsPerWeek },
  { key: "months", label: "Months", seconds: SecondsPerMonth },
  { key: "years", label: "Years", seconds: SecondsPerYear },
]

type Preset = { label: string; seconds: number | null }

const Presets: Preset[] = [
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
  const [unitsOpen, setUnitsOpen] = useState(false)
  const [presetsOpen, setPresetsOpen] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)

  const selectPreset = (seconds: number | null) => {
    const u = selectUnit(seconds)

    setUnit(u)
    setNum(
      u.seconds == null
        ? 1
        : Math.max(1, Math.round((seconds as number) / u.seconds)),
    )
    setPresetsOpen(false)
    onChange(seconds)
  }

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
            value={isUnlimited ? "" : num || ""}
            onFocus={() => setPresetsOpen(true)}
            onChange={onNumberChange}
            disabled={disabled || isUnlimited}
            className="rounded-r-none"
          />
        </PopoverPrimitive.Anchor>

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
              {Presets.map((p) => (
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
      </Popover>

      <Popover open={unitsOpen} onOpenChange={setUnitsOpen}>
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
          <ul className="h-fit">
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
