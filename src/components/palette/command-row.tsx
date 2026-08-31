import { CommandItem } from "@/components/ui/command"
import EnterHint from "@/components/enter-hint"

import type { Command } from "@/types/palette"

import { useFavoriteCommands } from "@/hooks/use-favorites"

import Favorite from "./favorite"

export interface CommandRowProps {
  command: Command
  selectedValue: string
  onSelect: () => void
  value?: string
}

export default function CommandRow({
  command,
  selectedValue,
  onSelect,
  value,
}: CommandRowProps) {
  const favorites = useFavoriteCommands()
  const isFavorite = favorites.includes(command.id)
  const rowValue = value ?? command.id
  const showEnterHint = selectedValue === rowValue

  return (
    <CommandItem
      value={rowValue}
      keywords={[command.label, ...(command.keywords ?? [])]}
      highlighted={showEnterHint}
      tabbable
      onSelect={onSelect}
      className="group/palette-row"
    >
      <command.icon />
      <span className="min-w-0 flex-1 truncate">{command.label}</span>
      <div className="ml-auto flex shrink-0 items-center gap-2">
        <Favorite
          commandId={command.id}
          isFavorite={isFavorite}
          className={
            isFavorite
              ? undefined
              : "opacity-0 group-hover/palette-row:opacity-100 group-data-[selected=true]/palette-row:opacity-100 pointer-coarse:opacity-100"
          }
        />
        <EnterHint visible={showEnterHint} />
      </div>
    </CommandItem>
  )
}
