import { ChevronLeft } from "lucide-react"

import { CommandGroup, CommandItem } from "@/components/ui/command"

import { CREATE_ACTIONS } from "@/lib/palette"
import type { CreateAction } from "@/types/palette"

export interface NewPanelProps {
  onSelect: (action: CreateAction) => void
  onBack: () => void
}

export default function NewPanel({ onSelect, onBack }: NewPanelProps) {
  return (
    <CommandGroup heading="New">
      <CommandItem value="new:back" forceMount onSelect={onBack}>
        <ChevronLeft />
        <span>Back</span>
      </CommandItem>
      {CREATE_ACTIONS.map((action) => (
        <CommandItem
          key={action.key}
          value={`new:${action.key}`}
          forceMount
          onSelect={() => onSelect(action)}
        >
          <action.icon />
          <span>{action.label}</span>
        </CommandItem>
      ))}
    </CommandGroup>
  )
}
