import { ChevronLeft } from "lucide-react"

import { CommandGroup, CommandItem } from "@/components/ui/command"

import {
  COMMAND_SEARCH_RESOURCES,
  RESOURCE_ICON,
  RESOURCE_LABEL,
} from "@/lib/palette"
import type { CommandSearchResource } from "@/types/palette"

export interface FindPanelProps {
  onSelect: (resource: CommandSearchResource) => void
  onBack: () => void
}

export default function FindPanel({ onSelect, onBack }: FindPanelProps) {
  return (
    <CommandGroup heading="Find">
      <CommandItem value="find:back" forceMount onSelect={onBack}>
        <ChevronLeft />
        <span>Back</span>
      </CommandItem>
      {COMMAND_SEARCH_RESOURCES.map((resource) => {
        const Icon = RESOURCE_ICON[resource]
        return (
          <CommandItem
            key={resource}
            value={`find:${resource}`}
            forceMount
            onSelect={() => onSelect(resource)}
          >
            <Icon />
            <span>{RESOURCE_LABEL[resource]}</span>
          </CommandItem>
        )
      })}
    </CommandGroup>
  )
}
