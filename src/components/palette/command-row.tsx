import { CommandItem } from "@/components/ui/command"

import type { Command } from "@/types/palette"

export interface CommandRowProps {
  command: Command
  onSelect: () => void
}

export default function CommandRow({ command, onSelect }: CommandRowProps) {
  return (
    <CommandItem
      value={command.id}
      keywords={[command.label, ...(command.keywords ?? [])]}
      tabbable
      onSelect={onSelect}
    >
      <command.icon />
      <span>{command.label}</span>
    </CommandItem>
  )
}
