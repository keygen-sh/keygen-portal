import { CommandItem } from "@/components/ui/command"

import type { Command } from "@/types/palette"

import EnterHint, {
  ENTER_HINT_SELECTED_ROW_CLASS,
} from "@/components/enter-hint"

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
      className={showEnterHint ? ENTER_HINT_SELECTED_ROW_CLASS : undefined}
      tabbable
      onSelect={onSelect}
    >
      <command.icon />
      <span className="min-w-0 flex-1 truncate">{command.label}</span>
      <EnterHint visible={showEnterHint} className="ml-auto" />
    </CommandItem>
  )
}
