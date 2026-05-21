import { CommandGroup, CommandItem } from "@/components/ui/command"

import { ChevronLeft } from "lucide-react"

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
  onBack: () => void
  onResourceSelect: (item: AnyResource) => void
  onFirstResultValueChange?: (value: string | null) => void
}

export default function Find({
  commands,
  resource,
  chipState,
  validationError = null,
  onSelect,
  onBack,
  onResourceSelect,
  onFirstResultValueChange,
}: FindProps) {
  return (
    <>
      <CommandGroup>
        <CommandItem value="find:back" forceMount tabbable onSelect={onBack}>
          <ChevronLeft />
          <span>Back</span>
        </CommandItem>
      </CommandGroup>
      {resource ? (
        <Search
          resource={resource}
          chipState={chipState}
          validationError={validationError}
          onResourceSelect={onResourceSelect}
          onFirstResultValueChange={onFirstResultValueChange}
        />
      ) : (
        <CommandGroup heading="Find">
          {commands.map((command) => (
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
