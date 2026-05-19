import { ChevronLeft } from "lucide-react"

import { CommandGroup, CommandItem } from "@/components/ui/command"

import { FILTER_PRESETS, RESOURCE_LABEL } from "@/lib/palette"
import type { FilterableResource, FilterPreset } from "@/types/palette"

export interface FilterPanelProps {
  onSelect: (preset: FilterPreset) => void
  onBack: () => void
}

export default function FilterPanel({ onSelect, onBack }: FilterPanelProps) {
  const resources = Array.from(
    new Set(FILTER_PRESETS.map((p) => p.type)),
  ) as FilterableResource[]

  return (
    <>
      <CommandGroup heading="Filter">
        <CommandItem value="filter:back" forceMount onSelect={onBack}>
          <ChevronLeft />
          <span>Back</span>
        </CommandItem>
      </CommandGroup>
      {resources.map((resource) => (
        <CommandGroup key={resource} heading={RESOURCE_LABEL[resource]}>
          {FILTER_PRESETS.filter((p) => p.type === resource).map((preset) => (
            <CommandItem
              key={preset.id}
              value={`filter:${preset.id}`}
              forceMount
              onSelect={() => onSelect(preset)}
            >
              <preset.icon />
              <span>{preset.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      ))}
    </>
  )
}
