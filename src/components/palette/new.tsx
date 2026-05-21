import { CommandGroup, CommandItem } from "@/components/ui/command"

import { ChevronLeft } from "lucide-react"

import type { Command } from "@/types/palette"

import CommandRow from "./command-row"

export interface NewProps {
  commands: Command[]
  onSelect: (command: Command) => void
  onBack: () => void
}

export default function New({ commands, onSelect, onBack }: NewProps) {
  return (
    <>
      <CommandGroup>
        <CommandItem value="new:back" forceMount tabbable onSelect={onBack}>
          <ChevronLeft />
          <span>Back</span>
        </CommandItem>
      </CommandGroup>
      <CommandGroup heading="New">
        {commands.map((command) => (
          <CommandRow
            key={command.id}
            command={command}
            onSelect={() => onSelect(command)}
          />
        ))}
      </CommandGroup>
    </>
  )
}
