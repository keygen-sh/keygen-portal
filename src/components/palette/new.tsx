import { CommandGroup } from "@/components/ui/command"

import type { Command } from "@/types/palette"

import CommandRow from "./command-row"

export interface NewProps {
  commands: Command[]
  onSelect: (command: Command) => void
}

export default function New({ commands, onSelect }: NewProps) {
  return (
    <>
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
