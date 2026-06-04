import { useState, useEffect, useMemo, useRef } from "react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Command, CommandList, CommandItem } from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { type LucideIcon } from "lucide-react"

import {
  resourceConfigs,
  getDefaultLabel,
  MIN_SEARCH_LENGTH,
} from "@/lib/search"
import { cn } from "@/lib/utils"
import { truncator } from "@/lib/truncate"

import { type SearchOperator, type SearchableResource } from "@/types/search"

import { useSearch } from "@/queries/search"

import { type FilterState, useFilterState } from "@/hooks/use-filter-state"

import {
  FilterSegment,
  FilterOptionList,
  FilterSegmentGroup,
  FilterPopoverSegment,
} from "./filter-segment"
import * as Loading from "@/components/loading"

const truncate = truncator("end", { maxLength: 8 })

const segmentTriggerClassName = (isDraft: boolean) =>
  cn(
    "inline-flex h-full cursor-pointer items-center px-0.5 text-xs transition-colors outline-none",
    isDraft
      ? "bg-background-2/60 text-content-disabled italic hover:brightness-125"
      : "bg-secondary/20 text-secondary hover:text-secondary-light",
  )

export type PolymorphicResourceType = {
  value: string
  label: string
  resource?: SearchableResource
}

export type PolymorphicResourceValue = { type: string; id: string }

export interface PolymorphicResourceFilterProps {
  label: string
  icon?: LucideIcon
  placeholder?: string
  types: ReadonlyArray<PolymorphicResourceType>
  value?: PolymorphicResourceValue
  onChange: (value: PolymorphicResourceValue | undefined) => void
}

export default function PolymorphicResourceFilter({
  label,
  icon,
  placeholder,
  types,
  value,
  onChange,
}: PolymorphicResourceFilterProps) {
  const filter = useFilterState<PolymorphicResourceValue>(
    value,
    { type: types[0]?.value ?? "", id: "" },
    onChange,
  )
  const [open, setOpen] = useState(false)

  if (types.length === 0) return null

  const current = filter.value
  const selectedType = types.find((t) => t.value === current.type) ?? types[0]

  function handleDraft() {
    filter.handleDraft()
    setOpen(true)
  }

  function handleTypeChange(type: string) {
    filter.handleDraftChange({ type, id: "" })
    setOpen(true)
  }

  function commitId(id: string | null) {
    if (id) {
      filter.handleChange({ type: current.type, id })
    } else {
      filter.handleDeactivate()
    }
    setOpen(false)
  }

  function handleActivate() {
    filter.handleActivate()
    setOpen(false)
  }

  return (
    <FilterSegmentGroup
      state={filter.state}
      icon={icon}
      label={label}
      onDraft={handleDraft}
      onActivate={handleActivate}
      onDeactivate={filter.handleDeactivate}
      confirmDisabled={!current.id}
    >
      <FilterSegment>{label}</FilterSegment>

      <FilterPopoverSegment
        className="w-36"
        popover={(close) => (
          <FilterOptionList
            options={types}
            value={current.type}
            onSelect={(type) => {
              handleTypeChange(type)
              close()
            }}
          />
        )}
      >
        {selectedType?.value ?? "type"}
      </FilterPopoverSegment>

      <FilterSegment>
        <span className="h-3 w-0 self-center border-l border-dotted border-current opacity-50" />
      </FilterSegment>

      {selectedType?.resource ? (
        <ResourceSearchSegment
          key={selectedType.value}
          state={filter.state}
          resource={selectedType.resource}
          displayValue={current.id ? truncate(current.id) : null}
          open={open}
          onOpenChange={setOpen}
          onSelect={commitId}
        />
      ) : (
        <IdInputSegment
          key={selectedType?.value ?? "id"}
          state={filter.state}
          value={current.id}
          placeholder={placeholder}
          open={open}
          onOpenChange={setOpen}
          onApply={commitId}
        />
      )}
    </FilterSegmentGroup>
  )
}

function ResourceSearchSegment({
  state,
  resource,
  displayValue,
  open,
  onOpenChange,
  onSelect,
}: {
  state: FilterState
  resource: SearchableResource
  displayValue: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (id: string | null) => void
}) {
  const isDraft = state === "draft"
  const config = resourceConfigs[resource]
  const getLabel = config?.getLabel ?? getDefaultLabel

  const [query, setQuery] = useState("")
  const [appliedQuery, setAppliedQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const [searchType, searchQuery, searchOp] = useMemo<
    [
      SearchableResource | null,
      Record<string, string>,
      SearchOperator | undefined,
    ]
  >(() => {
    if (!config || appliedQuery.length < MIN_SEARCH_LENGTH) {
      return [null, {}, undefined]
    }
    const search = config.searchQuery(appliedQuery)
    return [resource, search.query, search.op]
  }, [config, resource, appliedQuery])

  const { data: results = [], isFetching } = useSearch(
    searchType,
    searchQuery,
    searchOp,
  )

  useEffect(() => {
    if (!open) {
      setQuery("")
      setAppliedQuery("")
      return
    }
    const id = requestAnimationFrame(() => inputRef.current?.focus())
    return () => cancelAnimationFrame(id)
  }, [open])

  const canApply = query.trim().length >= MIN_SEARCH_LENGTH

  function handleApply() {
    const trimmed = query.trim()
    if (trimmed.length < MIN_SEARCH_LENGTH) return
    setAppliedQuery(trimmed)
  }

  const showResults =
    appliedQuery.length >= MIN_SEARCH_LENGTH && query.trim() === appliedQuery

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button type="button" className={segmentTriggerClassName(isDraft)}>
          {displayValue ?? "select..."}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-72 !bg-background p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <Command shouldFilter={false} className="!bg-background">
          <div className={cn("p-2", showResults && "border-b border-accent")}>
            <Input
              ref={inputRef}
              value={query}
              placeholder={
                config?.searchPlaceholder ?? "Search by ID or name..."
              }
              fieldSize="sm"
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return
                e.preventDefault()
                e.stopPropagation()
                if (canApply) handleApply()
              }}
            />
          </div>
          {showResults && (
            <CommandList className="p-1">
              <ScrollArea className={cn(results.length > 5 && "h-48")}>
                {isFetching ? (
                  <div className="flex w-full justify-center py-4">
                    <Loading.Dots className="bg-content-subdued!" />
                  </div>
                ) : results.length > 0 ? (
                  results.map((option) => (
                    <CommandItem
                      key={option.id}
                      value={option.id}
                      onSelect={() => onSelect(option.id)}
                      className="cursor-pointer"
                    >
                      {getLabel(option)}
                    </CommandItem>
                  ))
                ) : (
                  <div className="px-2 py-1.5 text-sm text-content-subdued">
                    No results found
                  </div>
                )}
              </ScrollArea>
            </CommandList>
          )}
        </Command>
        <div className="flex items-center gap-2 border-t p-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1 rounded-sm text-sm"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            className="flex-1 rounded-sm text-sm"
            onClick={handleApply}
            disabled={!canApply}
          >
            Search
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function IdInputSegment({
  state,
  value,
  placeholder,
  open,
  onOpenChange,
  onApply,
}: {
  state: FilterState
  value: string
  placeholder?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onApply: (id: string | null) => void
}) {
  const isDraft = state === "draft"

  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    const id = requestAnimationFrame(() => inputRef.current?.focus())
    return () => cancelAnimationFrame(id)
  }, [open])

  function handleApply() {
    const trimmed = draft.trim()
    onApply(trimmed || null)
  }

  function handleCancel() {
    setDraft(value)
    onOpenChange(false)
  }

  function handleOpen() {
    setDraft(value)
    onOpenChange(true)
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (next) {
          handleOpen()
        } else {
          handleCancel()
        }
      }}
    >
      <PopoverTrigger asChild>
        <button type="button" className={segmentTriggerClassName(isDraft)}>
          {value ? truncate(value) : "select..."}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-64 !bg-background p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <div className="p-2">
          <Input
            ref={inputRef}
            fieldSize="sm"
            placeholder={placeholder ?? "ID"}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && draft.trim()) handleApply()
            }}
          />
        </div>
        <div className="flex items-center gap-2 border-t p-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1 rounded-sm bg-popover text-sm"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            className="flex-1 rounded-sm text-sm"
            onClick={handleApply}
            disabled={!draft.trim()}
          >
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
