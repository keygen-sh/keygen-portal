import { useEffect, useMemo } from "react"

import {
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command"

import {
  RESOURCE_LABEL,
  buildResourceSearch,
  parseCommittedInputState,
} from "@/lib/palette"
import { labelFor } from "@/lib/search"
import { truncator } from "@/lib/truncate"

import {
  type SearchInputState,
  type CommandSearchResource,
} from "@/types/palette"
import type { AnyResource } from "@/types/api"

import { useSearch } from "@/queries/search"

import EnterHint from "@/components/enter-hint"
import * as Loading from "@/components/loading"

const truncateId = truncator("clip", { maxLength: 8 })

function SearchRow({
  item,
  selectedValue,
  onResourceSelect,
}: {
  item: AnyResource
  selectedValue: string
  onResourceSelect: (item: AnyResource) => void
}) {
  const value = `${item.type}:${item.id}`
  const showEnterHint = selectedValue === value

  return (
    <CommandItem
      value={value}
      highlighted={showEnterHint}
      forceMount
      tabbable
      onSelect={() => onResourceSelect(item)}
    >
      <span className="min-w-0 flex-1 truncate">{labelFor(item)}</span>
      <div className="ml-auto flex shrink-0 items-center gap-2">
        <span className="truncate text-xs text-muted-foreground">
          {truncateId(item.id)}
        </span>
        <EnterHint visible={showEnterHint} />
      </div>
    </CommandItem>
  )
}

export interface SearchProps {
  resource: CommandSearchResource
  chipState: SearchInputState
  selectedValue: string
  validationError?: string | null
  onResourceSelect: (item: AnyResource) => void
  onFirstResultValueChange?: (value: string | null) => void
}

export default function Search({
  resource,
  chipState,
  selectedValue,
  validationError = null,
  onResourceSelect,
  onFirstResultValueChange,
}: SearchProps) {
  const parsed = useMemo(() => parseCommittedInputState(chipState), [chipState])

  const built = validationError ? null : buildResourceSearch(resource, parsed)
  const search = useSearch(
    built ? resource : null,
    built?.query ?? {},
    built?.op,
  )

  const canSearch = built !== null
  const firstResult = search.data?.[0]
  const firstResultValue =
    canSearch && firstResult ? `${firstResult.type}:${firstResult.id}` : null

  useEffect(() => {
    if (canSearch && search.isFetching && !firstResult) return

    onFirstResultValueChange?.(firstResultValue)
  }, [
    canSearch,
    firstResult,
    firstResultValue,
    search.isFetching,
    onFirstResultValueChange,
  ])

  return (
    <div>
      {canSearch && search.isFetching && (
        <div className="my-8 flex w-full justify-center px-4 text-xs text-muted-foreground">
          <Loading.Dots />
        </div>
      )}

      {canSearch && !search.isFetching && (search.data?.length ?? 0) === 0 && (
        <CommandEmpty>No results.</CommandEmpty>
      )}

      {canSearch && (search.data?.length ?? 0) > 0 && (
        <CommandGroup heading={RESOURCE_LABEL[resource]} forceMount>
          {search.data!.map((item) => (
            <SearchRow
              key={`${item.type}:${item.id}`}
              item={item}
              selectedValue={selectedValue}
              onResourceSelect={onResourceSelect}
            />
          ))}
        </CommandGroup>
      )}
    </div>
  )
}
