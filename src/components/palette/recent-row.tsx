import { CommandItem } from "@/components/ui/command"

import { History } from "lucide-react"

import { RESOURCE_ICON, recentKey } from "@/lib/palette"

import type { Command, RecentItem } from "@/types/palette"

export interface RecentRowProps {
  item: RecentItem
  command?: Command
  onSelect: () => void
}

export default function RecentRow({ item, command, onSelect }: RecentRowProps) {
  const Icon =
    item.kind === "resource"
      ? RESOURCE_ICON[item.resource]
      : (command?.icon ?? History)
  return (
    <CommandItem
      value={`recent:${recentKey(item)}`}
      keywords={[item.label]}
      tabbable
      onSelect={onSelect}
    >
      <Icon />
      <span className="truncate">{item.label}</span>
    </CommandItem>
  )
}
