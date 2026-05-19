import { useEffect, useMemo, useState, type ReactElement } from "react"
import { useNavigate } from "@tanstack/react-router"

import {
  CommandDialog,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Code,
  Filter,
  History,
  LifeBuoy,
  Plus,
  Search,
} from "lucide-react"

import {
  ACCOUNT_ACTIONS,
  API_URL,
  CREATE_ACTIONS,
  DOCS_URL,
  EMPTY_SEARCH_INPUT,
  FILTER_PRESETS,
  isInputEmpty,
  KEYWORD,
  loadRecents,
  parseInputState,
  RECENTS_LIMIT,
  RESOURCE_LIST_PATH,
  saveRecents,
  SUPPORT_EMAIL,
} from "@/lib/palette"
import { getDefaultLabel, resourceConfigs } from "@/lib/search"

import type { SearchOption } from "@/types/search"
import type { AnyResource } from "@/types/api"
import {
  DialogKey,
  type AccountAction,
  type CommandSearchResource,
  type CreateAction,
  type FilterPreset,
  type RecentItem,
  type SearchInputState,
} from "@/types/palette"

import { useCloud } from "@/hooks/use-cloud"
import { useResourceNavigate } from "@/hooks/use-resource-navigate"

import * as keygen from "@/keygen"

import * as Users from "@/components/users"
import * as Groups from "@/components/groups"
import * as Motion from "@/components/motion"
import * as Palette from "@/components/palette"
import * as Packages from "@/components/packages"
import * as Policies from "@/components/policies"
import * as Products from "@/components/products"
import * as Releases from "@/components/releases"
import * as Licenses from "@/components/licenses"

type Mode = "find" | "filter" | "new" | null

export interface MenuProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function Menu({ open, onOpenChange }: MenuProps): ReactElement {
  const { isCloud } = useCloud()

  const accountActions = useMemo(
    () => ACCOUNT_ACTIONS.filter((a) => isCloud || !a.cloudOnly),
    [isCloud],
  )

  const [chipState, setChipState] =
    useState<SearchInputState>(EMPTY_SEARCH_INPUT)
  const [dialog, setDialog] = useState<DialogKey | null>(null)
  const [recents, setRecents] = useState<RecentItem[]>(() => loadRecents())
  const [mode, setMode] = useState<Mode>(null)
  const [direction, setDirection] = useState<1 | -1>(1)

  function enterMode(next: Mode) {
    setDirection(next === null ? -1 : 1)
    setMode(next)
  }

  function recordRecent(item: RecentItem) {
    setRecents((prev) => {
      const next = [item, ...prev.filter((r) => r.id !== item.id)].slice(
        0,
        RECENTS_LIMIT,
      )
      saveRecents(next)
      return next
    })
  }

  const navigate = useNavigate()
  const navigateToResource = useResourceNavigate()

  useEffect(() => {
    if (!open) {
      setChipState(EMPTY_SEARCH_INPUT)
      setMode(null)
      setDirection(1)
    }
  }, [open])

  function close() {
    onOpenChange(false)
  }

  const parsed = useMemo(() => parseInputState(chipState), [chipState])
  const chipInputEmpty = isInputEmpty(chipState)

  function updateChipState(next: SearchInputState) {
    const willBeEmpty = isInputEmpty(next)
    if (chipInputEmpty !== willBeEmpty) {
      setDirection(willBeEmpty ? -1 : 1)
    }
    setChipState(next)
  }

  useEffect(() => {
    if (!chipInputEmpty && mode !== null) setMode(null)
  }, [chipInputEmpty, mode])

  function runCreate(action: CreateAction) {
    recordRecent({
      id: `create:${action.key}`,
      label: `Create ${action.label.toLowerCase()}`,
      kind: "create",
      dialog: action.key,
    })
    close()
    setDialog(action.key)
  }

  function handleResourceSelect(item: AnyResource) {
    const config = resourceConfigs[item.type as CommandSearchResource]
    const getLabel = config?.getLabel ?? getDefaultLabel
    recordRecent({
      id: `${item.type}:${item.id}`,
      label: getLabel(item as SearchOption),
      kind: "resource",
      resource: item.type as CommandSearchResource,
    })
    void navigateToResource(item)
    close()
  }

  function handleListNavigate(resource: CommandSearchResource) {
    void navigate({
      to: RESOURCE_LIST_PATH[resource],
      params: { accountId: keygen.config.id },
    })
    close()
  }

  function handlePresetSelect(preset: FilterPreset) {
    recordRecent({
      id: `preset:${preset.id}`,
      label: preset.label,
      kind: "preset",
      presetId: preset.id,
    })
    void navigate({
      to: RESOURCE_LIST_PATH[preset.type],
      params: { accountId: keygen.config.id },
      search: preset.search,
    })
    close()
  }

  function handleAccountSelect(action: AccountAction) {
    void navigate({
      to: action.to,
      params: { accountId: keygen.config.id },
    })
    close()
  }

  function handleRecentSelect(item: RecentItem) {
    switch (item.kind) {
      case "resource":
        void navigate({
          to: `/$accountId/app/${item.resource}/$id`,
          params: { accountId: keygen.config.id, id: item.id.split(":")[1] },
        })
        close()
        return
      case "preset": {
        const preset = FILTER_PRESETS.find((p) => p.id === item.presetId)
        if (preset) handlePresetSelect(preset)
        return
      }
      case "create": {
        const action = CREATE_ACTIONS.find((a) => a.key === item.dialog)
        if (action) runCreate(action)
        return
      }
    }
  }

  function handleFindSelect(resource: CommandSearchResource) {
    updateChipState({
      chips: [{ keyword: KEYWORD.Type, value: resource }],
      pending: null,
      text: "",
    })
    requestAnimationFrame(() => {
      const input = document.querySelector<HTMLInputElement>(
        '[data-slot="command-input-wrapper"] input',
      )
      input?.focus()
    })
  }

  function clearSearch() {
    updateChipState(EMPTY_SEARCH_INPUT)
  }

  function onDialogOpenChange(open: boolean) {
    if (!open) setDialog(null)
  }

  const home = (
    <div key="home">
      <CommandGroup heading="Quick actions">
        <CommandItem
          value="action:find"
          forceMount
          keywords={["find", "search"]}
          onSelect={() => enterMode("find")}
        >
          <Search />
          <span>Find</span>
          <ChevronRight className="ml-auto size-4 text-muted-foreground" />
        </CommandItem>
        <CommandItem
          value="action:filter"
          forceMount
          keywords={["filter"]}
          onSelect={() => enterMode("filter")}
        >
          <Filter />
          <span>Filter</span>
          <ChevronRight className="ml-auto size-4 text-muted-foreground" />
        </CommandItem>
        <CommandItem
          value="action:new"
          forceMount
          keywords={["new", "create"]}
          onSelect={() => enterMode("new")}
        >
          <Plus />
          <span>New</span>
          <ChevronRight className="ml-auto size-4 text-muted-foreground" />
        </CommandItem>
      </CommandGroup>

      {recents.length > 0 && (
        <CommandGroup heading="Recent">
          {recents.map((item) => (
            <CommandItem
              key={item.id}
              value={`recent:${item.id}`}
              forceMount
              onSelect={() => handleRecentSelect(item)}
            >
              <History />
              <span className="truncate">{item.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      )}

      <CommandGroup heading="Account">
        {accountActions.map((action) => (
          <CommandItem
            key={action.id}
            value={`account:${action.id}`}
            forceMount
            onSelect={() => handleAccountSelect(action)}
          >
            <action.icon />
            <span>{action.label}</span>
          </CommandItem>
        ))}
      </CommandGroup>

      <CommandGroup heading="Help">
        <CommandItem
          value="help:docs"
          keywords={["docs", "documentation", "help"]}
          onSelect={() => {
            window.open(DOCS_URL, "_blank", "noopener,noreferrer")
            close()
          }}
        >
          <BookOpen />
          <span>Documentation</span>
        </CommandItem>
        <CommandItem
          value="help:api"
          keywords={["api", "reference", "developer"]}
          onSelect={() => {
            window.open(API_URL, "_blank", "noopener,noreferrer")
            close()
          }}
        >
          <Code />
          <span>API reference</span>
        </CommandItem>
        <CommandItem
          value="help:support"
          keywords={["support", "help", "contact", "email"]}
          onSelect={() => {
            window.location.href = `mailto:${SUPPORT_EMAIL}`
            close()
          }}
        >
          <LifeBuoy />
          <span>Get support</span>
        </CommandItem>
      </CommandGroup>
    </div>
  )

  const panel =
    mode === "find" ? (
      <div key="find">
        <Palette.FindPanel
          onSelect={handleFindSelect}
          onBack={() => enterMode(null)}
        />
      </div>
    ) : mode === "filter" ? (
      <div key="filter">
        <Palette.FilterPanel
          onSelect={handlePresetSelect}
          onBack={() => enterMode(null)}
        />
      </div>
    ) : mode === "new" ? (
      <div key="new">
        <Palette.NewPanel onSelect={runCreate} onBack={() => enterMode(null)} />
      </div>
    ) : null

  return (
    <>
      <CommandDialog
        open={open}
        onOpenChange={onOpenChange}
        shouldFilter={chipInputEmpty}
      >
        <Palette.Header
          state={chipState}
          onChange={updateChipState}
          parsed={parsed}
          hideTip={mode !== null}
        />

        <CommandList className="max-h-none! overflow-visible!">
          <div className="flex max-h-[480px] flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto">
              <Motion.Slide direction={direction} offset={40} duration={0.2}>
                {!chipInputEmpty ? (
                  <div key="search">
                    <CommandGroup>
                      <CommandItem
                        value="results:back"
                        forceMount
                        onSelect={clearSearch}
                      >
                        <ChevronLeft />
                        <span>Back</span>
                      </CommandItem>
                    </CommandGroup>
                    <Palette.ChipResults
                      parsed={parsed}
                      onResourceSelect={handleResourceSelect}
                      onListNavigate={handleListNavigate}
                    />
                  </div>
                ) : (
                  (panel ?? home)
                )}
              </Motion.Slide>
            </div>

            <Palette.Footer onClose={close} />
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
