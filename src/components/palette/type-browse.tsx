import { CommandGroup, CommandItem } from "@/components/ui/command"

import { RESOURCE_LABEL } from "@/lib/palette"
import { getDefaultLabel, resourceConfigs } from "@/lib/search"

import type { AnyResource } from "@/types/api"
import type { SearchOption } from "@/types/search"
import { type CommandSearchResource } from "@/types/palette"

import { useTypeBrowseData } from "@/hooks/use-type-browse-data"

export interface TypeBrowseProps {
  type: CommandSearchResource
  onSelect: (resource: AnyResource) => void
}

export default function TypeBrowse({ type, onSelect }: TypeBrowseProps) {
  const { data } = useTypeBrowseData(type)
  const config = resourceConfigs[type]
  const getLabel = config.getLabel ?? getDefaultLabel

  if (data.length === 0) return null

  return (
    <CommandGroup heading={`Recent ${RESOURCE_LABEL[type].toLowerCase()}`}>
      {data.map((item) => (
        <CommandItem
          key={`${type}:${item.id}`}
          value={`${type}:${item.id}`}
          onSelect={() => onSelect(item)}
        >
          <span className="truncate">{getLabel(item as SearchOption)}</span>
          <span className="ml-auto truncate text-xs text-muted-foreground">
            {item.id}
          </span>
        </CommandItem>
      ))}
    </CommandGroup>
  )
}
