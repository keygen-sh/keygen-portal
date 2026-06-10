import { ComponentType } from "react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { SectionRangeDays } from "./chart-constants"

export default function SectionHeader<T extends SectionRangeDays>({
  title,
  icon: Icon,
  rangeDays,
  options,
  onRangeChange,
}: {
  title: string
  icon: ComponentType<{ className?: string }>
  rangeDays: T
  options: readonly { value: T; label: string }[]
  onRangeChange: (rangeDays: T) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2 text-sm font-medium text-content-muted">
        <Icon className="size-4 shrink-0 text-content-subdued" />
        <span className="truncate">{title}</span>
      </div>
      <Select
        value={String(rangeDays)}
        onValueChange={(value) => onRangeChange(Number(value) as T)}
      >
        <SelectTrigger size="sm" className="w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end">
          {options.map((option) => (
            <SelectItem key={option.value} value={String(option.value)}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
