import { useState, useRef, useMemo } from "react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Command, CommandList, CommandItem } from "@/components/ui/command"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"

import { ChevronsUpDown } from "lucide-react"

import { useSearch } from "@/queries/search"
import { resourceConfigs, getDefaultLabel } from "@/lib/search"
import {
  SearchOption,
  SearchOperator,
  SearchableResource,
} from "@/types/search"

import { cn } from "@/lib/utils"
import { truncator, TruncateStyle } from "@/lib/truncate"

import * as Loading from "@/components/loading"

interface SearchSelectProps<T extends SearchOption> {
  value: string | null | undefined
  onChange: (value: string | null) => void
  options: T[]
  resource?: SearchableResource
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string | React.ReactElement
  allowClear?: boolean
  clearLabel?: string
  invalid?: boolean
  autoFocus?: boolean
  truncate?: TruncateStyle
  truncateLength?: number
  className?: string
}

export default function SearchSelect<T extends SearchOption>({
  value,
  onChange,
  options,
  resource,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  allowClear = true,
  clearLabel = "Clear",
  invalid = false,
  autoFocus,
  truncate,
  truncateLength = 36,
  className,
}: SearchSelectProps<T>) {
  const config = resource ? resourceConfigs[resource] : null

  const getLabel = config?.getLabel ?? getDefaultLabel
  const renderOption = config?.renderOption ?? null

  const resolvedPlaceholder =
    placeholder ?? config?.placeholder ?? "Select one..."
  const resolvedSearchPlaceholder =
    searchPlaceholder ?? config?.searchPlaceholder ?? "Search by ID or name..."
  const resolvedEmptyMessage =
    emptyMessage ?? config?.emptyMessage ?? "No results found"

  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(autoFocus ?? false)

  const inputRef = useRef<HTMLInputElement>(null)
  const labelRef = useRef(new Map<string, string>())

  const [searchType, searchQuery, searchOp] = useMemo<
    [
      SearchableResource | null,
      Record<string, string>,
      SearchOperator | undefined,
    ]
  >(() => {
    if (!config || !resource || query.length < 3) {
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

  const format = useMemo(
    () =>
      truncate ? truncator(truncate, { maxLength: truncateLength }) : null,
    [truncate, truncateLength],
  )

  const labelMap = useMemo(
    () => new Map(options.map((option) => [option.id, getLabel(option)])),
    [options, getLabel],
  )

  const optionMap = useMemo(
    () => new Map(options.map((option) => [option.id, option])),
    [options],
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

  const selectedLabel = value
    ? (labelMap.get(value) ?? labelRef.current.get(value) ?? null)
    : null
  const displayLabel = selectedLabel
    ? format
      ? format(selectedLabel)
      : selectedLabel
    : null

  const handleSelect = (id: string | null) => {
    onChange(id)
    setQuery("")
    setOpen(false)
  }

  const trigger = (
    <Button
      variant="outline"
      role="combobox"
      aria-expanded={open}
      autoFocus={autoFocus}
      className={cn(
        "w-full justify-between font-normal",
        !displayLabel && "text-content-subdued",
        invalid && "border-destructive!",
        className,
      )}
    >
      <span className="truncate">
        {renderOption && value && optionMap.get(value)
          ? renderOption(optionMap.get(value)!)
          : (displayLabel ?? resolvedPlaceholder)}
      </span>
      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
    </Button>
  )

  return (
    <Popover modal open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-(--radix-popover-trigger-width) p-0"
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
              placeholder={resolvedSearchPlaceholder}
              fieldSize="sm"
              className="h-8"
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setOpen(false)
                  setQuery("")
                }
              }}
            />
          </div>

          <CommandList className="p-1">
            <ScrollArea className={cn(visibleOptions.length > 5 && "h-48")}>
              {allowClear && visibleOptions.length > 0 && !query && (
                <CommandItem
                  onSelect={() => handleSelect(null)}
                  className="cursor-pointer text-content-subdued"
                >
                  {clearLabel}
                </CommandItem>
              )}

              {isSearching ? (
                <div className="flex w-full justify-center py-4">
                  <Loading.Dots className="bg-content-subdued!" />
                </div>
              ) : visibleOptions.length > 0 ? (
                visibleOptions.map((option) => {
                  const label = getLabel(option)
                  const displayOptionLabel = renderOption
                    ? renderOption(option)
                    : format
                      ? format(label)
                      : label

                  return (
                    <CommandItem
                      key={option.id}
                      value={option.id}
                      onSelect={() => handleSelect(option.id)}
                      className="cursor-pointer"
                    >
                      {displayOptionLabel}
                    </CommandItem>
                  )
                })
              ) : (
                <div className="px-2 py-1 text-sm text-content-normal">
                  {resolvedEmptyMessage}
                </div>
              )}
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
