import { useState, useRef, useMemo, type KeyboardEvent } from "react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"
import {
  Command,
  CommandList,
  CommandItem,
  CommandEmpty,
} from "@/components/ui/command"

import { useSearch } from "@/queries/search"
import { resourceConfigs, getDefaultLabel } from "@/lib/search"
import {
  SearchOption,
  SearchOperator,
  SearchableResource,
} from "@/types/search"

import * as Loading from "@/components/loading"

interface SearchMultiSelectProps<T extends SearchOption> {
  value: string[]
  onChange: (value: string[]) => void
  options: T[]
  resource: SearchableResource
  placeholder?: string
  disabled?: boolean
  autoFocus?: boolean
  className?: string
}

export default function SearchMultiSelect<T extends SearchOption>({
  value,
  onChange,
  options,
  resource,
  placeholder,
  disabled,
  autoFocus,
  className,
}: SearchMultiSelectProps<T>) {
  const config = resourceConfigs[resource]
  const getLabel = config.getLabel ?? getDefaultLabel

  const selected = value ?? []
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef(new Map<string, string>())

  const [searchType, searchQuery, searchOp] = useMemo<
    [
      SearchableResource | null,
      Record<string, string>,
      SearchOperator | undefined,
    ]
  >(() => {
    if (query.length < 3) {
      return [null, {}, undefined]
    }
    const search = config.searchQuery(query)
    return [resource, search.query, search.op]
  }, [config, resource, query])

  const { data: searchData, isFetching: isSearching } = useSearch(
    searchType,
    searchQuery,
    searchOp,
  )

  if (searchData) {
    for (const item of searchData) {
      labelRef.current.set(item.id, getLabel(item))
    }
  }

  const labelMap = useMemo(
    () => new Map(options.map((option) => [option.id, getLabel(option)])),
    [options, getLabel],
  )

  const visibleOptions = useMemo(() => {
    if (searchType != null && searchData) {
      return searchData
    }

    if (!query) return options

    const lowerQuery = query.toLowerCase()
    return options.filter(
      (option) =>
        getLabel(option).toLowerCase().includes(lowerQuery) ||
        option.id.toLowerCase().includes(lowerQuery),
    )
  }, [searchType, searchData, query, options, getLabel])

  const resolveLabel = (id: string) =>
    labelMap.get(id) ?? labelRef.current.get(id) ?? id

  const toggle = (id: string) => {
    const isActive = selected.includes(id)
    const next = isActive ? selected.filter((v) => v !== id) : [...selected, id]
    onChange(next)
    setQuery("")
    inputRef.current?.focus()
  }

  const remove = (id: string) => {
    onChange(selected.filter((v) => v !== id))
  }

  return (
    <Popover modal open={!disabled && open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <ScrollArea
          ref={triggerRef}
          tabIndex={0}
          onPointerDownCapture={(e) => {
            if (e.target !== triggerRef.current) return
            e.stopPropagation()
          }}
          onClickCapture={(e) => {
            if (e.target !== triggerRef.current) return
            e.stopPropagation()
          }}
          type="always"
          scrollHideDelay={0}
          className={cn(
            "max-h-48 cursor-pointer overflow-y-auto rounded-md border border-accent transition-colors duration-300 focus-within:border-content-subdued hover:bg-background-1",
            "**:data-radix-scroll-area-thumb:bg-content-muted data-[state=open]:border-content-subdued",
            className,
          )}
        >
          <div className="flex min-h-9 w-full flex-wrap items-center gap-x-2 gap-y-2 p-2 text-sm">
            {selected.map((id) => (
              <Badge
                key={id}
                className="h-5 cursor-pointer text-content-muted"
                onClick={(e) => {
                  e.stopPropagation()
                  remove(id)
                }}
              >
                {resolveLabel(id)} <span className="ml-1">&times;</span>
              </Badge>
            ))}

            {selected.length === 0 && (
              <span className="pointer-events-none text-content-subdued">
                {placeholder ?? config.searchPlaceholder}
              </span>
            )}
          </div>
        </ScrollArea>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="min-w-64 p-0"
        onOpenAutoFocus={(e) => {
          e.preventDefault()
          inputRef.current?.focus()
        }}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <Command shouldFilter={false}>
          <div className="border-b border-accent p-2">
            <Input
              ref={inputRef}
              value={query}
              placeholder={config.searchPlaceholder}
              autoFocus={autoFocus}
              fieldSize="sm"
              className="h-8"
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Escape") {
                  setOpen(false)
                  setQuery("")
                }
              }}
            />
          </div>

          <CommandList>
            <ScrollArea className={cn(visibleOptions.length > 5 && "h-48")}>
              {isSearching ? (
                <div className="flex w-full justify-center py-4">
                  <Loading.Dots className="bg-content-subdued!" />
                </div>
              ) : (
                visibleOptions.map((option) => {
                  const label = getLabel(option)

                  return (
                    <CommandItem
                      key={option.id}
                      value={option.id}
                      onSelect={() => toggle(option.id)}
                      className="cursor-pointer"
                    >
                      <Checkbox
                        checked={selected.includes(option.id)}
                        className="pointer-events-none mr-2"
                      />
                      {label}
                    </CommandItem>
                  )
                })
              )}
            </ScrollArea>

            {!isSearching && visibleOptions.length === 0 && (
              <CommandEmpty className="p-2 text-sm text-content-normal">
                {config.emptyMessage}
              </CommandEmpty>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
