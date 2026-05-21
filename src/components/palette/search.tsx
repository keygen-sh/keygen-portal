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

import {
  type SearchInputState,
  type CommandSearchResource,
} from "@/types/palette"
import type { AnyResource } from "@/types/api"

import { useSearch } from "@/queries/search"
import { useDebounced } from "@/hooks/use-debounced"

import * as Loading from "@/components/loading"

export interface SearchProps {
  resource: CommandSearchResource
  chipState: SearchInputState
  validationError?: string | null
  onResourceSelect: (item: AnyResource) => void
  onFirstResultValueChange?: (value: string | null) => void
}

export default function Search({
  resource,
  chipState,
  validationError = null,
  onResourceSelect,
  onFirstResultValueChange,
}: SearchProps) {
  const debouncedChipState = useDebounced(chipState, 300)
  const debouncedParsed = useMemo(
    () => parseCommittedInputState(debouncedChipState),
    [debouncedChipState],
  )

  const built = validationError
    ? null
    : buildResourceSearch(resource, debouncedParsed)
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
            <CommandItem
              key={`${item.type}:${item.id}`}
              value={`${item.type}:${item.id}`}
              forceMount
              tabbable
              onSelect={() => onResourceSelect(item)}
            >
              <span className="truncate">{labelFor(item)}</span>
              <span className="ml-auto truncate text-xs text-muted-foreground">
                {item.id}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
      )}
    </div>
  )
}
