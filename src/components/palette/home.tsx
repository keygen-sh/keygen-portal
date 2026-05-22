import {
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command"

import { Plus, Search, Filter, Copy, ChevronRight } from "lucide-react"

import { recentKey } from "@/lib/palette"

import type { Command, RecentItem } from "@/types/palette"

import EnterHint, {
  ENTER_HINT_SELECTED_ROW_CLASS,
} from "@/components/enter-hint"
import RecentRow from "./recent-row"
import CommandRow from "./command-row"

export interface HomeProps {
  filterText: string
  selectedValue: string
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
  onCopyAccountId: () => void
  onCommandSelect: (command: Command) => void
  onRecentSelect: (item: RecentItem) => void
}

export default function Home({
  filterText,
  selectedValue,
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
  onCopyAccountId,
  onCommandSelect,
  onRecentSelect,
}: HomeProps) {
  const isTyping = filterText.trim().length > 0
  const showFindEnterHint = selectedValue === "action:find"
  const showFilterEnterHint = selectedValue === "action:filter"
  const showNewEnterHint = selectedValue === "action:new"
  const showCopyAccountIdEnterHint = selectedValue === "account:copy-id"

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
          className={
            showFindEnterHint ? ENTER_HINT_SELECTED_ROW_CLASS : undefined
          }
          tabbable
          onSelect={onOpenFind}
        >
          <Search />
          <span className="min-w-0 flex-1 truncate">Find</span>
          <div className="ml-auto flex shrink-0 items-center gap-2">
            <EnterHint visible={showFindEnterHint} />
            <ChevronRight className="size-4 text-muted-foreground" />
          </div>
        </CommandItem>
        <CommandItem
          value="action:filter"
          keywords={["filter", "presets"]}
          className={
            showFilterEnterHint ? ENTER_HINT_SELECTED_ROW_CLASS : undefined
          }
          tabbable
          onSelect={onOpenFilter}
        >
          <Filter />
          <span className="min-w-0 flex-1 truncate">Filter</span>
          <div className="ml-auto flex shrink-0 items-center gap-2">
            <EnterHint visible={showFilterEnterHint} />
            <ChevronRight className="size-4 text-muted-foreground" />
          </div>
        </CommandItem>
        <CommandItem
          value="action:new"
          keywords={["new", "create"]}
          className={
            showNewEnterHint ? ENTER_HINT_SELECTED_ROW_CLASS : undefined
          }
          tabbable
          onSelect={onOpenNew}
        >
          <Plus />
          <span className="min-w-0 flex-1 truncate">New</span>
          <div className="ml-auto flex shrink-0 items-center gap-2">
            <EnterHint visible={showNewEnterHint} />
            <ChevronRight className="size-4 text-muted-foreground" />
          </div>
        </CommandItem>
      </CommandGroup>

      {liveRecents.length > 0 && (
        <CommandGroup heading="Recent">
          {liveRecents.map((item) => (
            <RecentRow
              key={recentKey(item)}
              item={item}
              selectedValue={selectedValue}
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
                selectedValue={selectedValue}
                onSelect={() => onCommandSelect(command)}
              />
            ))}
          </CommandGroup>
          <CommandGroup heading="Filter">
            {filterCommands.map((command) => (
              <CommandRow
                key={command.id}
                command={command}
                selectedValue={selectedValue}
                onSelect={() => onCommandSelect(command)}
              />
            ))}
          </CommandGroup>
          <CommandGroup heading="New">
            {newCommands.map((command) => (
              <CommandRow
                key={command.id}
                command={command}
                selectedValue={selectedValue}
                onSelect={() => onCommandSelect(command)}
              />
            ))}
          </CommandGroup>
        </>
      )}

      <CommandGroup heading="Account">
        <CommandItem
          value="account:copy-id"
          keywords={["copy", "account", "id"]}
          className={
            showCopyAccountIdEnterHint
              ? ENTER_HINT_SELECTED_ROW_CLASS
              : undefined
          }
          tabbable
          onSelect={onCopyAccountId}
        >
          <Copy />
          <span className="min-w-0 flex-1 truncate">Copy account ID</span>
          <EnterHint visible={showCopyAccountIdEnterHint} className="ml-auto" />
        </CommandItem>
        {accountCommands.map((command) => (
          <CommandRow
            key={command.id}
            command={command}
            selectedValue={selectedValue}
            onSelect={() => onCommandSelect(command)}
          />
        ))}
      </CommandGroup>

      <CommandGroup heading="Help">
        {helpCommands.map((command) => (
          <CommandRow
            key={command.id}
            command={command}
            selectedValue={selectedValue}
            onSelect={() => onCommandSelect(command)}
          />
        ))}
      </CommandGroup>
    </div>
  )
}
