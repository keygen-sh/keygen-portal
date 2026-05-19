import { useMemo } from "react"

import {
  CommandItem,
  CommandGroup,
  CommandEmpty,
} from "@/components/ui/command"

import {
  RESOURCE_LABEL,
  isTypeOnlyBrowse,
  buildResourceSearch,
  COMMAND_SEARCH_RESOURCES,
} from "@/lib/palette"
import { getDefaultLabel, resourceConfigs } from "@/lib/search"

import type { AnyResource } from "@/types/api"
import type { SearchOption } from "@/types/search"
import type { CommandSearchResource, ParsedSearch } from "@/types/palette"

import { useSearchFanout } from "@/queries/search"

import TypeBrowse from "./type-browse"
import * as Loading from "@/components/loading"

export interface ChipResultsProps {
  parsed: ParsedSearch
  onResourceSelect: (item: AnyResource) => void
  onListNavigate: (resource: CommandSearchResource) => void
}

export default function ChipResults({
  parsed,
  onResourceSelect,
  onListNavigate,
}: ChipResultsProps) {
  const typeOnly = isTypeOnlyBrowse(parsed)

  const fanoutInputs = useMemo(
    () =>
      COMMAND_SEARCH_RESOURCES.map((resource) => {
        const built = typeOnly ? null : buildResourceSearch(resource, parsed)
        return {
          resource,
          query: built?.query ?? {},
          op: built?.op,
          enabled: built != null,
        }
      }),
    [parsed, typeOnly],
  )

  const { results, isFetching } = useSearchFanout(fanoutInputs)

  const fanoutGroups = results.filter(({ data }) => data.length > 0)
  const anyQueryFired = fanoutInputs.some((i) => i.enabled)

  if (typeOnly && parsed.type) {
    return (
      <>
        <CommandGroup heading="Pages" forceMount>
          <CommandItem
            value={`page:${parsed.type}`}
            forceMount
            onSelect={() => onListNavigate(parsed.type!)}
          >
            <span>View all {RESOURCE_LABEL[parsed.type].toLowerCase()}</span>
          </CommandItem>
        </CommandGroup>
        <TypeBrowse type={parsed.type} onSelect={onResourceSelect} />
      </>
    )
  }

  return (
    <>
      {isFetching && (
        <div className="my-8 flex w-full justify-center px-4 text-xs text-muted-foreground">
          <Loading.Dots />
        </div>
      )}

      {anyQueryFired && fanoutGroups.length === 0 && !isFetching && (
        <CommandEmpty>No results.</CommandEmpty>
      )}

      {fanoutGroups.map(({ resource, data }) => {
        const config = resourceConfigs[resource]
        const getLabel = config.getLabel ?? getDefaultLabel
        return (
          <CommandGroup
            key={resource}
            heading={RESOURCE_LABEL[resource]}
            forceMount
          >
            {data.map((item) => (
              <CommandItem
                key={`${resource}:${item.id}`}
                value={`${resource}:${item.id}`}
                forceMount
                onSelect={() => onResourceSelect(item)}
              >
                <span className="truncate">
                  {getLabel(item as SearchOption)}
                </span>
                <span className="ml-auto truncate text-xs text-muted-foreground">
                  {item.id}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )
      })}
    </>
  )
}
