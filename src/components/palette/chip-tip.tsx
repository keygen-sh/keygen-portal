import { Lightbulb } from "lucide-react"

import { COMMAND_SEARCH_FIELDS, KEYWORD } from "@/lib/palette"
import type {
  CommandSearchResource,
  FieldKeyword,
  Keyword,
} from "@/types/palette"

export interface ChipTipProps {
  resource?: CommandSearchResource | null
}

// NB(cazden) empty-state hint; resource-specific keywords surface only after a `type:` chip is committed
const COMMON_FIELDS: ReadonlyArray<FieldKeyword> = [
  KEYWORD.Id,
  KEYWORD.Name,
  KEYWORD.Metadata,
]

function displayFor(keyword: Keyword): string {
  return keyword === KEYWORD.Metadata ? "metadata:k=v" : `${keyword}:`
}

export default function ChipTip({ resource = null }: ChipTipProps) {
  const fields: ReadonlyArray<Keyword> = resource
    ? COMMAND_SEARCH_FIELDS[resource]
    : [KEYWORD.Type, ...COMMON_FIELDS]

  return (
    <div className="flex items-start gap-2 px-3 py-3 text-xs text-muted-foreground">
      <Lightbulb className="mt-0.5 size-3.5 shrink-0" />
      <div className="flex flex-col gap-1.5">
        Narrow your search with keywords.
        <div className="flex flex-wrap items-center gap-1">
          {fields.map((field) => (
            <code
              key={field}
              className="rounded-sm bg-accent px-1 py-0.5 text-[11px]"
            >
              {displayFor(field)}
            </code>
          ))}
        </div>
      </div>
    </div>
  )
}
