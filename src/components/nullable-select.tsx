import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "@/components/ui/select"

import { cn } from "@/lib/utils"
import React from "react"

const CLEAR = "__CLEAR__" as const

type NullableSelectProps<T extends string> = {
  value: T | null | undefined
  onChange: (v: T | null) => void
  invalid: boolean
  clearLabel?: string
  placeholder?: string
  className?: string
  disabled?: boolean
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
  children,
}: NullableSelectProps<T>): React.ReactElement {
  const rendered = (value ?? "") as string

  return (
    <Select
      value={rendered}
      onValueChange={(v) => onChange(v === CLEAR || v === "" ? null : (v as T))}
    >
      <SelectTrigger
        className={cn("w-full", invalid && "!border-destructive", className)}
        disabled={disabled}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem className="text-content-subdued" value={CLEAR}>
          {clearLabel}
        </SelectItem>
        {children}
      </SelectContent>
    </Select>
  )
}
