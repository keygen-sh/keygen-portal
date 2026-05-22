import { CommandItem } from "@/components/ui/command"
import EnterHint from "@/components/enter-hint"

import type { Command } from "@/types/palette"

export interface CommandRowProps {
  command: Command
  selectedValue: string
  onSelect: () => void
}

export default function CommandRow({
  command,
  selectedValue,
  onSelect,
}: CommandRowProps) {
  const showEnterHint = selectedValue === command.id

  return (
    <CommandItem
      value={command.id}
      keywords={[command.label, ...(command.keywords ?? [])]}
      highlighted={showEnterHint}
      tabbable
      onSelect={onSelect}
    >
      <command.icon />
      <span className="min-w-0 flex-1 truncate">{command.label}</span>
      <EnterHint visible={showEnterHint} className="ml-auto" />
    </CommandItem>
  )
}
