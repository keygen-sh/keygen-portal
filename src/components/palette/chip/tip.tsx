import { type ReactNode } from "react"
import { Lightbulb } from "lucide-react"

import { COMMAND_SEARCH_FIELDS, displayKeyword } from "@/lib/palette"
import { type Keyword, type CommandSearchResource } from "@/types/palette"

export interface TipProps {
  resource?: CommandSearchResource | null
  fields?: ReadonlyArray<Keyword>
  children?: ReactNode
  onKeywordSelect?: (keyword: Keyword) => void
}

export default function Tip({
  resource = null,
  fields,
  children = "Narrow your search with keywords.",
  onKeywordSelect,
}: TipProps) {
  const visibleFields: ReadonlyArray<Keyword> =
    fields ?? (resource ? COMMAND_SEARCH_FIELDS[resource] : [])

  return (
    <div className="flex items-start gap-2 px-3 py-3 text-xs text-muted-foreground">
      <Lightbulb className="mt-0.5 size-3.5 shrink-0" />
      <div className="flex flex-col gap-1.5">
        {children}
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
                {displayKeyword(field)}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
