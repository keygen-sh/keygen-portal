import { useMemo } from "react"

import { CommandGroup, CommandItem } from "@/components/ui/command"

import { ChevronLeft } from "lucide-react"

import { RESOURCE_LABEL } from "@/lib/palette"

import type { Command, FilterableResource } from "@/types/palette"

import CommandRow from "./command-row"

export interface FilterProps {
  commands: Command[]
  onSelect: (command: Command) => void
  onBack: () => void
}

export default function Filter({ commands, onSelect, onBack }: FilterProps) {
  const grouped = useMemo(() => {
    const map = new Map<FilterableResource, Command[]>()
    for (const command of commands) {
      if (command.kind !== "preset") continue
      const list = map.get(command.preset.type) ?? []
      list.push(command)
      map.set(command.preset.type, list)
    }
    return Array.from(map.entries())
  }, [commands])

  return (
    <>
      <CommandGroup>
        <CommandItem value="filter:back" forceMount tabbable onSelect={onBack}>
          <ChevronLeft />
          <span>Back</span>
        </CommandItem>
      </CommandGroup>
      {grouped.map(([resource, group]) => (
        <CommandGroup key={resource} heading={RESOURCE_LABEL[resource]}>
          {group.map((command) => (
            <CommandRow
              key={command.id}
              command={command}
              onSelect={() => onSelect(command)}
            />
          ))}
        </CommandGroup>
      ))}
    </>
  )
}
