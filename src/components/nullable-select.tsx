import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"

import { cn } from "@/lib/utils"

const CLEAR = "__CLEAR__" as const

type NullableSelectProps<T extends string> = {
  value: T | null | undefined
  onChange: (v: T | null) => void
  invalid: boolean
  clearLabel?: string
  placeholder?: string
  className?: string
  disabled?: boolean
  disabledTooltip?: string
  autoFocus?: boolean
  children: React.ReactNode
}

export default function NullableSelect<T extends string>({
  value,
  onChange,
  invalid,
  clearLabel = "Clear",
  placeholder = "Select one...",
  className,
  disabled = false,
  disabledTooltip,
  autoFocus,
  children,
}: NullableSelectProps<T>): React.ReactElement {
  const rendered = (value ?? "") as string

  const trigger = (
    <SelectTrigger
      className={cn("w-full", invalid && "border-destructive!", className)}
      disabled={disabled}
      autoFocus={autoFocus}
    >
      <SelectValue placeholder={placeholder} />
    </SelectTrigger>
  )

  return (
    <Select
      value={rendered}
      onValueChange={(v) => onChange(v === CLEAR || v === "" ? null : (v as T))}
    >
      {disabled && disabledTooltip ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <span tabIndex={0}>{trigger}</span>
          </TooltipTrigger>
          <TooltipContent className="max-w-64 bg-background-4 text-pretty text-content-muted">
            {disabledTooltip}
          </TooltipContent>
        </Tooltip>
      ) : (
        trigger
      )}
      <SelectContent>
        <SelectItem className="text-content-subdued" value={CLEAR}>
          {clearLabel}
        </SelectItem>
        {children}
      </SelectContent>
    </Select>
  )
}
