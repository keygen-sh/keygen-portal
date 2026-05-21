import { useMemo } from "react"

import { CommandGroup } from "@/components/ui/command"

import { commandFilter } from "@/lib/palette"
import type { Command } from "@/types/palette"
import type { AnyResource } from "@/types/api"
import type { SearchInputState, CommandSearchResource } from "@/types/palette"

import Search from "./search"
import CommandRow from "./command-row"

export interface FindProps {
  commands: Command[]
  resource: CommandSearchResource | null
  chipState: SearchInputState
  validationError?: string | null
  onSelect: (command: Command) => void
  onResourceSelect: (item: AnyResource) => void
  onFirstResultValueChange?: (value: string | null) => void
}

export default function Find({
  commands,
  resource,
  chipState,
  validationError = null,
  onSelect,
  onResourceSelect,
  onFirstResultValueChange,
}: FindProps) {
  const commandSearchText =
    !resource && !chipState.pending ? chipState.text : ""
  const visibleCommands = useMemo(() => {
    const query = commandSearchText.trim()
    if (!query) return commands

    return commands
      .map((command) => ({
        command,
        score: commandFilter(command.id, query, [
          command.label,
          ...(command.keywords ?? []),
        ]),
      }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ command }) => command)
  }, [commands, commandSearchText])

  return (
    <>
      {resource ? (
        <Search
          resource={resource}
          chipState={chipState}
          validationError={validationError}
          onResourceSelect={onResourceSelect}
          onFirstResultValueChange={onFirstResultValueChange}
        />
      ) : commandSearchText.trim() && visibleCommands.length === 0 ? (
        <div className="py-6 text-center text-sm">No matching commands.</div>
      ) : (
        <CommandGroup heading="Find">
          {visibleCommands.map((command) => (
            <CommandRow
              key={command.id}
              command={command}
              onSelect={() => onSelect(command)}
            />
          ))}
        </CommandGroup>
      )}
    </>
  )
}
