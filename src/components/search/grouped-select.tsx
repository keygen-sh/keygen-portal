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

import { ChevronsUpDown, X } from "lucide-react"

import { useSearch } from "@/queries/search"
import {
  resourceConfigs,
  getDefaultLabel,
  MIN_SEARCH_LENGTH,
} from "@/lib/search"
import {
  SearchOption,
  SearchOperator,
  SearchableResource,
} from "@/types/search"

import { cn } from "@/lib/utils"
import { truncator, TruncateStyle } from "@/lib/truncate"

import * as Loading from "@/components/loading"

interface OptionGroup<T extends SearchOption> {
  key: string
  label: string
  options: T[]
}

interface GroupedSearchSelectProps<T extends SearchOption> {
  value: string | null | undefined
  onChange: (value: string | null) => void
  groups: OptionGroup<T>[]
  resource: SearchableResource
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

export default function GroupedSearchSelect<T extends SearchOption>({
  value,
  onChange,
  groups,
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
}: GroupedSearchSelectProps<T>) {
  const config = resourceConfigs[resource]
  const getLabel = config.getLabel ?? getDefaultLabel

  const resolvedPlaceholder = placeholder ?? config.placeholder
  const resolvedSearchPlaceholder =
    searchPlaceholder ?? config.searchPlaceholder
  const resolvedEmptyMessage = emptyMessage ?? config.emptyMessage

  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const labelRef = useRef(new Map<string, string>())

  const allOptions = useMemo(() => groups.flatMap((g) => g.options), [groups])

  const [searchType, searchQuery, searchOp] = useMemo<
    [
      SearchableResource | null,
      Record<string, string>,
      SearchOperator | undefined,
    ]
  >(() => {
    if (query.length < MIN_SEARCH_LENGTH) {
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
    () => new Map(allOptions.map((option) => [option.id, getLabel(option)])),
    [allOptions, getLabel],
  )

  const visibleGroups = useMemo(() => {
    if (searchType != null && searchData) {
      return [
        { key: "__search__", label: "Search results", options: searchData },
      ]
    }

    if (!query) return groups

    const lowerQuery = query.toLowerCase()
    return groups
      .map((group) => ({
        ...group,
        options: group.options.filter(
          (option) =>
            getLabel(option).toLowerCase().includes(lowerQuery) ||
            option.id.toLowerCase().includes(lowerQuery),
        ),
      }))
      .filter((group) => group.options.length > 0)
  }, [searchType, searchData, query, groups, getLabel])

  const hasVisibleOptions = visibleGroups.some((g) => g.options.length > 0)
  const totalVisible = visibleGroups.reduce(
    (sum, g) => sum + g.options.length,
    0,
  )

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
      <span className="truncate">{displayLabel ?? resolvedPlaceholder}</span>
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
          <div className="relative border-b border-accent p-2">
            <Input
              ref={inputRef}
              value={query}
              placeholder={resolvedSearchPlaceholder}
              fieldSize="sm"
              className="h-8 pr-8"
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setOpen(false)
                  setQuery("")
                }
              }}
            />
            <button
              type="button"
              aria-label="Dismiss"
              className="absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden"
              onClick={() => {
                setOpen(false)
                setQuery("")
              }}
            >
              <X className="size-4" />
            </button>
          </div>

          <CommandList className="p-1">
            <ScrollArea className={cn(totalVisible > 5 && "h-48")}>
              {allowClear && hasVisibleOptions && !query && (
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
              ) : hasVisibleOptions ? (
                visibleGroups.map((group) => (
                  <div key={group.key}>
                    <div className="px-2 py-1.5 text-xs font-medium text-content-subdued">
                      {group.label}
                    </div>
                    {group.options.map((option) => {
                      const label = getLabel(option)
                      const displayOptionLabel = format ? format(label) : label

                      return (
                        <CommandItem
                          key={option.id}
                          value={option.id}
                          onSelect={() => handleSelect(option.id)}
                          className="cursor-pointer pl-4"
                        >
                          {displayOptionLabel}
                        </CommandItem>
                      )
                    })}
                  </div>
                ))
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
