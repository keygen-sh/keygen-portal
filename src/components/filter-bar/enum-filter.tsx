import { useState } from "react"

import { type LucideIcon } from "lucide-react"

import { useFilterState } from "@/hooks/use-filter-state"
import {
  FilterSegmentGroup,
  FilterSegment,
  FilterPopoverSegment,
  FilterOptionList,
} from "./filter-segment"

export interface EnumFilterProps {
  label: string
  icon?: LucideIcon
  options: ReadonlyArray<{ value: string; label: string }>
  value?: string
  onChange: (value: string | undefined) => void
  popoverClassName?: string
  renderOption?: (
    option: { value: string; label: string },
    query: string,
  ) => React.ReactNode
}

export default function EnumFilter({
  label,
  icon,
  options,
  value,
  onChange,
  popoverClassName,
  renderOption,
}: EnumFilterProps) {
  const filter = useFilterState(value, options[0]?.value ?? "", onChange)
  const [open, setOpen] = useState(false)

  const selected = options.find((o) => o.value === filter.value) || options[0]

  function handleDraft() {
    filter.handleDraft()
    setOpen(true)
  }

  return (
    <FilterSegmentGroup
      state={filter.state}
      icon={icon}
      label={label}
      onDraft={handleDraft}
      onActivate={filter.handleActivate}
      onDeactivate={filter.handleDeactivate}
    >
      <FilterSegment>{label}</FilterSegment>
      <FilterSegment>eq</FilterSegment>
      <EnumFilterSegment
        options={options}
        value={filter.value}
        open={open}
        onOpenChange={setOpen}
        onSelect={filter.handleChange}
        popoverClassName={popoverClassName}
        renderOption={renderOption}
      >
        {selected.label}
      </EnumFilterSegment>
    </FilterSegmentGroup>
  )
}

export function EnumFilterSegment({
  options,
  value,
  open,
  onOpenChange,
  onSelect,
  children,
  popoverClassName = "w-36",
  renderOption,
}: {
  options: ReadonlyArray<{ value: string; label: string }>
  value?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (value: string) => void
  children: React.ReactNode
  popoverClassName?: string
  renderOption?: (
    option: { value: string; label: string },
    query: string,
  ) => React.ReactNode
}) {
  return (
    <FilterPopoverSegment
      className={popoverClassName}
      open={open}
      onOpenChange={onOpenChange}
      popover={(close) => (
        <FilterOptionList
          options={options}
          value={value}
          renderOption={renderOption}
          onSelect={(v) => {
            onSelect(v)
            close()
          }}
        />
      )}
    >
      {children}
    </FilterPopoverSegment>
  )
}
