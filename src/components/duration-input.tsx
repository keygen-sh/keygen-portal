import { useState, useMemo, useRef } from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"

import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"

const SECONDS_PER_MINUTE = 60
const SECONDS_PER_HOUR = 3600
const SECONDS_PER_DAY = 86400
const SECONDS_PER_WEEK = 604800
const SECONDS_PER_MONTH = 2629746
const SECONDS_PER_YEAR = 31556952

type Unit = { key: string; label: string; seconds: number | null }

const DEFAULT_UNITS: Unit[] = [
  { key: "unlimited", label: "Unlimited", seconds: null },
  { key: "seconds", label: "Seconds", seconds: 1 },
  { key: "minutes", label: "Minutes", seconds: SECONDS_PER_MINUTE },
  { key: "hours", label: "Hours", seconds: SECONDS_PER_HOUR },
  { key: "days", label: "Days", seconds: SECONDS_PER_DAY },
  { key: "weeks", label: "Weeks", seconds: SECONDS_PER_WEEK },
  { key: "months", label: "Months", seconds: SECONDS_PER_MONTH },
  { key: "years", label: "Years", seconds: SECONDS_PER_YEAR },
]

type Preset = { label: string; seconds: number | null }

const DEFAULT_PRESETS: Preset[] = [
  { seconds: null, label: "Unlimited" },

  { seconds: SECONDS_PER_DAY * 1, label: "1 Day" },
  { seconds: SECONDS_PER_DAY * 2, label: "2 Days" },
  { seconds: SECONDS_PER_DAY * 3, label: "3 Days" },
  { seconds: SECONDS_PER_DAY * 4, label: "4 Days" },
  { seconds: SECONDS_PER_DAY * 5, label: "5 Days" },

  { seconds: SECONDS_PER_WEEK * 1, label: "1 Week" },
  { seconds: SECONDS_PER_WEEK * 2, label: "2 Weeks" },
  { seconds: SECONDS_PER_WEEK * 3, label: "3 Weeks" },
  { seconds: SECONDS_PER_WEEK * 4, label: "4 Weeks" },
  { seconds: SECONDS_PER_WEEK * 5, label: "5 Weeks" },

  { seconds: SECONDS_PER_MONTH * 1, label: "1 Month" },
  { seconds: SECONDS_PER_MONTH + SECONDS_PER_DAY * 1, label: "31 Days" },
  { seconds: SECONDS_PER_MONTH + SECONDS_PER_DAY * 2, label: "32 Days" },

  { seconds: SECONDS_PER_MONTH * 2, label: "2 Months" },
  { seconds: SECONDS_PER_MONTH * 3, label: "3 Months" },
  { seconds: SECONDS_PER_MONTH * 4, label: "4 Months" },
  { seconds: SECONDS_PER_MONTH * 5, label: "5 Months" },
  { seconds: SECONDS_PER_MONTH * 6, label: "6 Months" },
  { seconds: SECONDS_PER_MONTH * 9, label: "9 Months" },
  { seconds: SECONDS_PER_MONTH * 13, label: "13 Months" },

  { seconds: SECONDS_PER_YEAR * 1, label: "1 Year" },
  { seconds: SECONDS_PER_YEAR * 2, label: "2 Years" },
  { seconds: SECONDS_PER_YEAR * 3, label: "3 Years" },
]

function selectUnit(
  totalSeconds?: number | null,
  allowed: Unit[] = DEFAULT_UNITS,
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
  autoFocus?: boolean
  disabledTooltip?: string
  className?: string
}

export default function DurationInput({
  value,
  onChange,
  units,
  presets,
  disabled,
  autoFocus,
  disabledTooltip,
  className,
}: DurationInputProps): React.ReactElement {
  const availableUnits = useMemo(() => {
    if (!units || units.length === 0) return DEFAULT_UNITS
    const allowed = new Set(units)
    const filtered = DEFAULT_UNITS.filter((u) => allowed.has(u.key))
    return filtered.length > 0 ? filtered : DEFAULT_UNITS
  }, [units])

  const availablePresets = presets ?? DEFAULT_PRESETS

  const [unit, setUnit] = useState<Unit>(() =>
    selectUnit(value, availableUnits),
  )
  const [unitsOpen, setUnitsOpen] = useState(false)
  const [presetsOpen, setPresetsOpen] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)

  const num =
    value != null && value > 0 && unit.seconds != null
      ? Math.max(1, Math.round(value / unit.seconds))
      : null

  const apply = (n: number | null, u: Unit) => {
    if (n == null || u.seconds == null) onChange(null)
    else onChange(n > 0 ? n * u.seconds : null)
  }

  const selectPreset = (seconds: number | null) => {
    const selectedUnit = selectUnit(seconds, availableUnits)
    setUnit(selectedUnit)
    setPresetsOpen(false)
    onChange(seconds)
  }

  const onNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.currentTarget.value
    const next = raw === "" ? null : Number(raw)

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

    // default when switching from unlimited to another unit
    if (num == null && u.seconds != null) {
      apply(1, u)
    } else {
      apply(num, u)
    }
  }

  const isUnlimited = unit.seconds == null

  const content = (
    <div className={cn("flex items-stretch", className)}>
      <Popover
        open={presetsOpen}
        onOpenChange={setPresetsOpen}
        // FIXME(ezekg) nested dialogs break scroll area: https://github.com/radix-ui/primitives/issues/1159
        modal={true}
      >
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
            autoFocus={autoFocus}
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

  if (disabled && disabledTooltip) {
    return (
      <DisabledTooltip tooltip={disabledTooltip}>{content}</DisabledTooltip>
    )
  }

  return content
}

function DisabledTooltip({
  tooltip,
  children,
}: {
  tooltip: string
  children: React.ReactNode
}) {
  const isMobile = useMobile()
  const [open, setOpen] = useState(false)

  const trigger = (
    <span
      tabIndex={0}
      className={cn(
        "block rounded-md transition-colors",
        open ? "bg-background-1" : "hover:bg-background-1",
      )}
    >
      {children}
    </span>
  )

  if (isMobile) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>
        <PopoverContent className="max-w-64 bg-background-4 text-pretty text-content-muted">
          {tooltip}
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <Tooltip open={open} onOpenChange={setOpen}>
      <TooltipTrigger asChild>{trigger}</TooltipTrigger>
      <TooltipContent className="max-w-64 bg-background-4 text-pretty text-content-muted">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  )
}
