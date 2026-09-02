import { useLocation } from "@tanstack/react-router"

import {
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command"
import EnterHint from "@/components/enter-hint"

import {
  Plus,
  Star,
  Search,
  Filter,
  Copy,
  StarOff,
  ChevronRight,
  GripVertical,
} from "lucide-react"

import { recentKey } from "@/lib/palette"
import { viewRouteFor } from "@/lib/views"

import type { Command, RecentItem } from "@/types/palette"

import { useFavorites } from "@/hooks/use-favorites"
import { useListReorder } from "@/hooks/use-list-reorder"

import RecentRow from "./recent-row"
import CommandRow from "./command-row"

export interface HomeProps {
  filterText: string
  selectedValue: string
  recents: RecentItem[]
  favoriteCommands: Command[]
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
  onToggleFavoritePage: () => void
  onReorderFavorites: (from: number, to: number) => void
  onCommandSelect: (command: Command) => void
  onRecentSelect: (item: RecentItem) => void
}

export default function Home({
  filterText,
  selectedValue,
  recents,
  favoriteCommands,
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
  onToggleFavoritePage,
  onReorderFavorites,
  onCommandSelect,
  onRecentSelect,
}: HomeProps) {
  const pathname = useLocation({ select: (location) => location.pathname })
  const favorites = useFavorites()
  const currentRoute = viewRouteFor(pathname)
  const isPageFavorited = favorites.some((favorite) =>
    favorite.kind === "page"
      ? favorite.path === pathname
      : currentRoute != null && favorite.to === currentRoute.to,
  )

  const favoritesReorder = useListReorder(onReorderFavorites)

  const isTyping = filterText.trim().length > 0
  const showFindEnterHint = selectedValue === "action:find"
  const showFilterEnterHint = selectedValue === "action:filter"
  const showNewEnterHint = selectedValue === "action:new"
  const showFavoritePageEnterHint = selectedValue === "action:favorite-page"
  const showCopyAccountIdEnterHint = selectedValue === "account:copy-id"

  const liveRecents = recents.filter((r) =>
    r.kind === "resource"
      ? true
      : commandsById.has(r.commandId) &&
        !favoriteCommands.some((c) => c.id === r.commandId),
  )

  return (
    <div>
      <CommandEmpty>No matching commands.</CommandEmpty>

      <CommandGroup heading="Quick actions">
        <CommandItem
          value="action:find"
          keywords={["find", "search"]}
          highlighted={showFindEnterHint}
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
          highlighted={showFilterEnterHint}
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
          highlighted={showNewEnterHint}
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
        <CommandItem
          value="action:favorite-page"
          keywords={["favorite", "star", "pin", "bookmark", "page"]}
          highlighted={showFavoritePageEnterHint}
          tabbable
          onSelect={onToggleFavoritePage}
        >
          {isPageFavorited ? <StarOff /> : <Star />}
          <span className="min-w-0 flex-1 truncate">
            {isPageFavorited ? "Unfavorite this page" : "Favorite this page"}
          </span>
          <EnterHint visible={showFavoritePageEnterHint} className="ml-auto" />
        </CommandItem>
      </CommandGroup>

      {favoriteCommands.length > 0 && (
        <CommandGroup heading="Favorites">
          {favoriteCommands.map((command) => (
            <div key={command.id} data-reorder-item>
              <CommandRow
                value={`favorite:${command.id}`}
                command={command}
                selectedValue={selectedValue}
                onSelect={() => {
                  if (!favoritesReorder.isDragging()) onCommandSelect(command)
                }}
                dragHandle={
                  !isTyping && (
                    <button
                      type="button"
                      className="inline-flex size-5 shrink-0 cursor-grab touch-none items-center justify-center text-content-subdued opacity-0 group-hover/palette-row:opacity-100 group-data-[selected=true]/palette-row:opacity-100 active:cursor-grabbing pointer-coarse:opacity-100"
                      {...favoritesReorder.handleProps}
                    >
                      <GripVertical className="size-4! text-current" />
                    </button>
                  )
                }
              />
            </div>
          ))}
        </CommandGroup>
      )}

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
          highlighted={showCopyAccountIdEnterHint}
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
