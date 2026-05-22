import { useMemo } from "react"

import { CommandGroup } from "@/components/ui/command"

import { RESOURCE_LABEL } from "@/lib/palette"

import type { Command, FilterableResource } from "@/types/palette"

import CommandRow from "./command-row"

export interface FilterProps {
  commands: Command[]
  selectedValue: string
  onSelect: (command: Command) => void
}

export default function Filter({
  commands,
  selectedValue,
  onSelect,
}: FilterProps) {
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
      {grouped.map(([resource, group]) => (
        <CommandGroup key={resource} heading={RESOURCE_LABEL[resource]}>
          {group.map((command) => (
            <CommandRow
              key={command.id}
              command={command}
              selectedValue={selectedValue}
              onSelect={() => onSelect(command)}
            />
          ))}
        </CommandGroup>
      ))}
    </>
  )
}
