import { type ReactNode } from "react"
import { Lightbulb } from "lucide-react"

import { COMMAND_SEARCH_FIELDS, RESOURCE_SINGULAR } from "@/lib/palette"
import {
  KEYWORD,
  COMMAND_SEARCH_RESOURCES,
  type Keyword,
  type FieldKeyword,
  type CommandSearchResource,
} from "@/types/palette"

export interface TipProps {
  resource?: CommandSearchResource | null
  fields?: ReadonlyArray<Keyword>
  typeSuggestions?: boolean
  children?: ReactNode
  onKeywordSelect?: (keyword: Keyword) => void
  onTypeSelect?: (resource: CommandSearchResource) => void
}

const COMMON_FIELDS: ReadonlyArray<FieldKeyword> = [
  KEYWORD.Id,
  KEYWORD.Name,
  KEYWORD.Metadata,
]

function displayFor(keyword: Keyword): string {
  return keyword === KEYWORD.Metadata ? "metadata:k=v" : `${keyword}:`
}

export default function Tip({
  resource = null,
  fields,
  typeSuggestions = false,
  children = "Narrow your search with keywords.",
  onKeywordSelect,
  onTypeSelect,
}: TipProps) {
  const visibleFields: ReadonlyArray<Keyword> =
    fields ??
    (resource
      ? COMMAND_SEARCH_FIELDS[resource]
      : [KEYWORD.Type, ...COMMON_FIELDS])

  return (
    <div className="flex items-start gap-2 px-3 py-3 text-xs text-muted-foreground">
      <Lightbulb className="mt-0.5 size-3.5 shrink-0" />
      <div className="flex flex-col gap-1.5">
        {children}
        {typeSuggestions && (
          <div className="flex flex-wrap items-center gap-1">
            {COMMAND_SEARCH_RESOURCES.map((resource) => (
              <button
                key={resource}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onTypeSelect?.(resource)}
                className="rounded-sm bg-accent px-1 py-0.5 font-mono text-[11px] transition-colors hover:bg-accent/80 hover:text-foreground"
              >
                type:{RESOURCE_SINGULAR[resource]}
              </button>
            ))}
          </div>
        )}
        {visibleFields.length > 0 && (
          <div className="flex flex-wrap items-center gap-1">
            {visibleFields.map((field) => (
              <button
                key={field}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onKeywordSelect?.(field)}
                className="rounded-sm bg-accent px-1 py-0.5 font-mono text-[11px] transition-colors hover:bg-accent/80 hover:text-foreground"
              >
                {displayFor(field)}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
