import { CommandItem } from "@/components/ui/command"
import EnterHint from "@/components/enter-hint"

import { History } from "lucide-react"

import { RESOURCE_ICON, recentKey } from "@/lib/palette"

import type { Command, RecentItem } from "@/types/palette"

export interface RecentRowProps {
  item: RecentItem
  command?: Command
  selectedValue: string
  onSelect: () => void
}

export default function RecentRow({
  item,
  command,
  selectedValue,
  onSelect,
}: RecentRowProps) {
  const Icon =
    item.kind === "resource"
      ? RESOURCE_ICON[item.resource]
      : (command?.icon ?? History)
  const value = `recent:${recentKey(item)}`
  const showEnterHint = selectedValue === value

  return (
    <CommandItem
      value={value}
      keywords={[item.label]}
      highlighted={showEnterHint}
      tabbable
      onSelect={onSelect}
    >
      <Icon />
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      <EnterHint visible={showEnterHint} className="ml-auto" />
    </CommandItem>
  )
}
