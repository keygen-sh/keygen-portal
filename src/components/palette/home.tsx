import {
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command"

import { Plus, Search, Filter, ChevronRight } from "lucide-react"

import { recentKey } from "@/lib/palette"

import type { Command, RecentItem } from "@/types/palette"

import RecentRow from "./recent-row"
import CommandRow from "./command-row"

export interface HomeProps {
  filterText: string
  recents: RecentItem[]
  commandsById: Map<string, Command>
  findCommands: Command[]
  filterCommands: Command[]
  newCommands: Command[]
  accountCommands: Command[]
  helpCommands: Command[]
  onOpenFind: () => void
  onOpenFilter: () => void
  onOpenNew: () => void
  onCommandSelect: (command: Command) => void
  onRecentSelect: (item: RecentItem) => void
}

export default function Home({
  filterText,
  recents,
  commandsById,
  findCommands,
  filterCommands,
  newCommands,
  accountCommands,
  helpCommands,
  onOpenFind,
  onOpenFilter,
  onOpenNew,
  onCommandSelect,
  onRecentSelect,
}: HomeProps) {
  const isTyping = filterText.trim().length > 0

  const liveRecents = recents.filter((r) =>
    r.kind === "resource" ? true : commandsById.has(r.commandId),
  )

  return (
    <div>
      <CommandEmpty>No matching commands.</CommandEmpty>

      <CommandGroup heading="Quick actions">
        <CommandItem
          value="action:find"
          keywords={["find", "search"]}
          tabbable
          onSelect={onOpenFind}
        >
          <Search />
          <span>Find</span>
          <ChevronRight className="ml-auto size-4 text-muted-foreground" />
        </CommandItem>
        <CommandItem
          value="action:filter"
          keywords={["filter", "presets"]}
          tabbable
          onSelect={onOpenFilter}
        >
          <Filter />
          <span>Filter</span>
          <ChevronRight className="ml-auto size-4 text-muted-foreground" />
        </CommandItem>
        <CommandItem
          value="action:new"
          keywords={["new", "create"]}
          tabbable
          onSelect={onOpenNew}
        >
          <Plus />
          <span>New</span>
          <ChevronRight className="ml-auto size-4 text-muted-foreground" />
        </CommandItem>
      </CommandGroup>

      {liveRecents.length > 0 && (
        <CommandGroup heading="Recent">
          {liveRecents.map((item) => (
            <RecentRow
              key={recentKey(item)}
              item={item}
              command={
                item.kind === "command"
                  ? commandsById.get(item.commandId)
                  : undefined
              }
              onSelect={() => onRecentSelect(item)}
            />
          ))}
        </CommandGroup>
      )}

      {isTyping && (
        <>
          <CommandGroup heading="Find">
            {findCommands.map((command) => (
              <CommandRow
                key={command.id}
                command={command}
                onSelect={() => onCommandSelect(command)}
              />
            ))}
          </CommandGroup>
          <CommandGroup heading="Filter">
            {filterCommands.map((command) => (
              <CommandRow
                key={command.id}
                command={command}
                onSelect={() => onCommandSelect(command)}
              />
            ))}
          </CommandGroup>
          <CommandGroup heading="New">
            {newCommands.map((command) => (
              <CommandRow
                key={command.id}
                command={command}
                onSelect={() => onCommandSelect(command)}
              />
            ))}
          </CommandGroup>
        </>
      )}

      <CommandGroup heading="Account">
        {accountCommands.map((command) => (
          <CommandRow
            key={command.id}
            command={command}
            onSelect={() => onCommandSelect(command)}
          />
        ))}
      </CommandGroup>

      <CommandGroup heading="Help">
        {helpCommands.map((command) => (
          <CommandRow
            key={command.id}
            command={command}
            onSelect={() => onCommandSelect(command)}
          />
        ))}
      </CommandGroup>
    </div>
  )
}
