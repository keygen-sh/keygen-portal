import {
  useMemo,
  useState,
  useEffect,
  useCallback,
  type ReactElement,
} from "react"
import { useNavigate } from "@tanstack/react-router"
import { Command as CommandPrimitive } from "cmdk"

import { CommandDialog, CommandList } from "@/components/ui/command"

import {
  recentKey,
  resolveType,
  saveRecents,
  loadRecents,
  buildCommands,
  RECENTS_LIMIT,
  commandFilter,
  RESOURCE_SINGULAR,
  RESOURCE_LIST_PATH,
  EMPTY_SEARCH_INPUT,
  validateSearchInput,
  getSearchSuggestions,
  applySearchSuggestion,
  getInvalidSearchChipIndexes,
} from "@/lib/palette"
import { cn } from "@/lib/utils"
import { labelFor } from "@/lib/search"
import { copyToClipboard } from "@/lib/clipboard"

import {
  KEYWORD,
  DialogKey,
  type Command,
  type RecentItem,
  type SearchInputState,
  type CommandSearchResource,
} from "@/types/palette"
import type { AnyResource } from "@/types/api"

import { useCloud } from "@/hooks/use-cloud"
import { useResourceNavigate } from "@/hooks/use-resource-navigate"

import { useLogout } from "@/queries/auth"

import * as keygen from "@/keygen"

import * as Users from "@/components/users"
import * as Groups from "@/components/groups"
import * as Motion from "@/components/motion"
import * as Packages from "@/components/packages"
import * as Policies from "@/components/policies"
import * as Products from "@/components/products"
import * as Releases from "@/components/releases"
import * as Licenses from "@/components/licenses"

import Home from "./home"
import Find from "./find"
import Filter from "./filter"
import New from "./new"
import Footer from "./footer"
import * as Chip from "./chip"

type Screen =
  | { kind: "home" }
  | { kind: "command" }
  | { kind: "find" }
  | { kind: "filter" }
  | { kind: "new" }

export interface MenuProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const INPUT_CLASS = cn(
  "flex h-12 w-full bg-transparent px-4 py-3 text-sm outline-hidden",
  "placeholder:text-muted-foreground",
  "border-b",
)

export default function Menu({ open, onOpenChange }: MenuProps): ReactElement {
  const { isCloud } = useCloud()
  const commands = useMemo(() => buildCommands({ isCloud }), [isCloud])
  const commandsById = useMemo(
    () => new Map(commands.map((c) => [c.id, c])),
    [commands],
  )

  const findCommands = useMemo(
    () => commands.filter((c) => c.group === "find"),
    [commands],
  )
  const filterCommands = useMemo(
    () => commands.filter((c) => c.group === "filter"),
    [commands],
  )
  const newCommands = useMemo(
    () => commands.filter((c) => c.group === "new"),
    [commands],
  )
  const accountCommands = useMemo(
    () => commands.filter((c) => c.group === "account"),
    [commands],
  )
  const helpCommands = useMemo(
    () => commands.filter((c) => c.group === "help"),
    [commands],
  )

  const [screen, setScreen] = useState<Screen>({ kind: "home" })
  const [direction, setDirection] = useState<1 | -1>(1)
  const [chipState, setChipState] =
    useState<SearchInputState>(EMPTY_SEARCH_INPUT)
  const [filterText, setFilterText] = useState("")
  const [selectedValue, setSelectedValue] = useState("action:find")
  const [dialog, setDialog] = useState<DialogKey | null>(null)
  const [recents, setRecents] = useState<RecentItem[]>(() => loadRecents())
  const [chipFocusSignal, setChipFocusSignal] = useState(0)

  const navigate = useNavigate()
  const navigateToResource = useResourceNavigate()
  const logout = useLogout()

  useEffect(() => {
    if (!open) {
      setScreen({ kind: "home" })
      setChipState(EMPTY_SEARCH_INPUT)
      setFilterText("")
      setSelectedValue("action:find")
      setDirection(1)
    }
  }, [open])

  function close() {
    onOpenChange(false)
  }

  function focusChipInput() {
    setChipFocusSignal((prev) => prev + 1)
  }

  function recordRecent(item: RecentItem) {
    setRecents((prev) => {
      const key = recentKey(item)
      const next = [item, ...prev.filter((r) => recentKey(r) !== key)].slice(
        0,
        RECENTS_LIMIT,
      )
      saveRecents(next)
      return next
    })
  }

  function transitionTo(next: Screen, dir: 1 | -1) {
    setDirection(dir)
    setScreen(next)
    if (next.kind === "home" || next.kind === "find") {
      setChipState(EMPTY_SEARCH_INPUT)
      setFilterText("")
    } else if (next.kind === "filter" || next.kind === "new") {
      setFilterText("")
    }
  }

  useEffect(() => {
    switch (screen.kind) {
      case "home":
        setSelectedValue("action:find")
        return
      case "command":
        return
      case "find":
        setSelectedValue(findCommands[0]?.id ?? "find:back")
        return
      case "filter":
        setSelectedValue(filterCommands[0]?.id ?? "filter:back")
        return
      case "new":
        setSelectedValue(newCommands[0]?.id ?? "new:back")
        return
    }
  }, [screen, findCommands, filterCommands, newCommands])

  const handleFirstSearchResultValueChange = useCallback(
    (value: string | null) => {
      setSelectedValue(value ?? "find:back")
    },
    [],
  )

  function enterFindMode(resource: CommandSearchResource) {
    setDirection(1)
    setFilterText("")
    setChipState({
      chips: [{ keyword: KEYWORD.Type, value: RESOURCE_SINGULAR[resource] }],
      pending: null,
      text: "",
    })
    setScreen({ kind: "find" })
    focusChipInput()
  }

  function executeCommand(command: Command) {
    recordRecent({
      kind: "command",
      commandId: command.id,
      label: command.label,
    })

    switch (command.kind) {
      case "find":
        enterFindMode(command.resource)
        return
      case "preset":
        void navigate({
          to: RESOURCE_LIST_PATH[command.preset.type],
          params: { accountId: keygen.config.id },
          search: command.preset.search,
        })
        close()
        return
      case "create":
        close()
        setDialog(command.dialog)
        return
      case "navigate":
        void navigate({
          to: command.to,
          params: { accountId: keygen.config.id },
        })
        close()
        return
      case "external":
        window.open(command.url, "_blank", "noopener,noreferrer")
        close()
        return
      case "mailto":
        window.location.href = `mailto:${command.email}`
        close()
        return
    }
  }

  function handleResourceSelect(item: AnyResource) {
    recordRecent({
      kind: "resource",
      resource: item.type as CommandSearchResource,
      id: item.id,
      label: labelFor(item),
    })
    void navigateToResource(item)
    close()
  }

  function handleRecentSelect(item: RecentItem) {
    if (item.kind === "resource") {
      void navigateToResource({ type: item.resource, id: item.id })
      close()
      return
    }
    const command = commandsById.get(item.commandId)
    if (command) executeCommand(command)
  }

  function handleFilterTextChange(next: string) {
    setFilterText(next)

    if (screen.kind === "home" && next.trim().length > 0) {
      setDirection(1)
      setScreen({ kind: "command" })
    } else if (screen.kind === "command" && next.trim().length === 0) {
      transitionTo({ kind: "home" }, -1)
    }
  }

  function onDialogOpenChange(isOpen: boolean) {
    if (!isOpen) setDialog(null)
  }

  const activeFindResource = useMemo(() => {
    if (screen.kind !== "find") return null

    const typeChip = chipState.chips.find((c) => c.keyword === KEYWORD.Type)
    const chipResource = typeChip ? resolveType(typeChip.value) : null

    return chipResource
  }, [screen, chipState])

  const findValidationError = useMemo(
    () =>
      screen.kind === "find"
        ? validateSearchInput(activeFindResource, chipState)
        : null,
    [screen, activeFindResource, chipState],
  )

  const invalidChipIndexes = useMemo(
    () =>
      screen.kind === "find"
        ? getInvalidSearchChipIndexes(activeFindResource, chipState)
        : new Set<number>(),
    [screen, activeFindResource, chipState],
  )

  useEffect(() => {
    if (screen.kind === "find" && !activeFindResource) {
      setSelectedValue(findCommands[0]?.id ?? "find:back")
    }
  }, [screen, activeFindResource, findCommands])

  const usesChipInput = screen.kind === "find"
  const usesCmdkFilter = screen.kind !== "find"
  const chipSuggestions = useMemo(
    () =>
      screen.kind === "find"
        ? getSearchSuggestions(activeFindResource, chipState)
        : [],
    [screen, chipState, activeFindResource],
  )
  const chipFocusKey = screen.kind

  return (
    <>
      <CommandDialog
        open={open}
        onOpenChange={onOpenChange}
        shouldFilter={usesCmdkFilter}
        filter={commandFilter}
        value={selectedValue}
        onValueChange={setSelectedValue}
      >
        {usesChipInput ? (
          <Chip.Input
            state={chipState}
            onChange={setChipState}
            suggestions={chipSuggestions}
            onSuggestionSelect={(suggestion) => {
              setChipState((prev) => applySearchSuggestion(prev, suggestion))
              focusChipInput()
            }}
            invalidChipIndexes={invalidChipIndexes}
            focusKey={chipFocusKey}
            focusSignal={chipFocusSignal}
            placeholder={placeholderFor(screen)}
          />
        ) : (
          <CommandPrimitive.Input
            autoFocus
            value={filterText}
            onValueChange={handleFilterTextChange}
            placeholder={placeholderFor(screen)}
            className={INPUT_CLASS}
          />
        )}

        {findValidationError && (
          <div className="border-t border-destructive/20 px-3 py-2 text-xs text-destructive">
            {findValidationError}
          </div>
        )}

        {screen.kind === "find" && activeFindResource && (
          <Chip.Tip
            resource={activeFindResource}
            onKeywordSelect={(keyword) => {
              setChipState((prev) => ({ ...prev, pending: keyword, text: "" }))
              focusChipInput()
            }}
          >
            Search by entering an attribute.
          </Chip.Tip>
        )}

        {screen.kind === "find" && !activeFindResource && (
          <Chip.Tip fields={[]}>
            <p>
              Enter a{" "}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setChipState((prev) => ({
                    ...prev,
                    pending: KEYWORD.Type,
                    text: "",
                  }))
                  focusChipInput()
                }}
                className="rounded-sm bg-accent px-1 text-xs font-medium text-content-normal transition-colors hover:bg-accent/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                type:
              </button>{" "}
              or select an option below.
            </p>
          </Chip.Tip>
        )}

        <CommandList className="max-h-none! overflow-visible!">
          <div className="flex max-h-[480px] flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto">
              <Motion.Slide direction={direction} offset={40} duration={0.2}>
                {screen.kind === "home" || screen.kind === "command" ? (
                  <Home
                    key={screen.kind}
                    filterText={filterText}
                    recents={recents}
                    commandsById={commandsById}
                    findCommands={findCommands}
                    filterCommands={filterCommands}
                    newCommands={newCommands}
                    accountCommands={accountCommands}
                    helpCommands={helpCommands}
                    onOpenFind={() => transitionTo({ kind: "find" }, 1)}
                    onOpenFilter={() => transitionTo({ kind: "filter" }, 1)}
                    onOpenNew={() => transitionTo({ kind: "new" }, 1)}
                    onBack={() => transitionTo({ kind: "home" }, -1)}
                    onCommandSelect={executeCommand}
                    onRecentSelect={handleRecentSelect}
                  />
                ) : screen.kind === "find" ? (
                  <Find
                    key="find"
                    commands={findCommands}
                    resource={activeFindResource}
                    chipState={chipState}
                    validationError={findValidationError}
                    onSelect={executeCommand}
                    onBack={() => transitionTo({ kind: "home" }, -1)}
                    onResourceSelect={handleResourceSelect}
                    onFirstResultValueChange={
                      handleFirstSearchResultValueChange
                    }
                  />
                ) : screen.kind === "filter" ? (
                  <Filter
                    key="filter"
                    commands={filterCommands}
                    onSelect={executeCommand}
                    onBack={() => transitionTo({ kind: "home" }, -1)}
                  />
                ) : screen.kind === "new" ? (
                  <New
                    key="new"
                    commands={newCommands}
                    onSelect={executeCommand}
                    onBack={() => transitionTo({ kind: "home" }, -1)}
                  />
                ) : null}
              </Motion.Slide>
            </div>

            <Footer
              onCopyAccountId={() => {
                void copyToClipboard(keygen.config.id)
                close()
              }}
              onSignOut={() => {
                close()
                logout.mutate()
              }}
            />
          </div>
        </CommandList>
      </CommandDialog>

      <Licenses.Form.Create
        open={dialog === DialogKey.License}
        onOpenChange={onDialogOpenChange}
      />
      <Users.Form.Create
        open={dialog === DialogKey.User}
        onOpenChange={onDialogOpenChange}
      />
      <Groups.Form.Create
        open={dialog === DialogKey.Group}
        onOpenChange={onDialogOpenChange}
      />
      <Policies.Form.Create
        open={dialog === DialogKey.Policy}
        onOpenChange={onDialogOpenChange}
      />
      <Products.Form.Create
        open={dialog === DialogKey.Product}
        onOpenChange={onDialogOpenChange}
      />
      <Packages.Form.Create
        open={dialog === DialogKey.Package}
        onOpenChange={onDialogOpenChange}
      />
      <Releases.Form.Create
        open={dialog === DialogKey.Release}
        onOpenChange={onDialogOpenChange}
      />
    </>
  )
}

function placeholderFor(screen: Screen): string {
  switch (screen.kind) {
    case "home":
    case "command":
      return "Type a command..."
    case "find":
      return "Search for a resource..."
    case "filter":
      return "Filter presets..."
    case "new":
      return "New..."
  }
}
