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

import { cn } from "@/lib/utils"
import { getGroupLabel } from "@/lib/groups"
import { getLicenseLabel } from "@/lib/licenses"
import { truncator, TruncateStyle } from "@/lib/truncate"

import * as keygen from "@/keygen"

import GoToButton from "@/components/go-to-button"

type BaseOption = { id: string }
type NamedOption = BaseOption & { attributes: { name: string } }

type ResourceType = "license" | "group" | "user"

interface ResourceConfig {
  getLabel: (option: BaseOption) => string
  placeholder: string
  searchPlaceholder: string
  emptyMessage: React.ReactElement
}

const resourceConfigs: Record<ResourceType, ResourceConfig> = {
  license: {
    getLabel: getLicenseLabel as (option: BaseOption) => string,
    placeholder: "Select a license...",
    searchPlaceholder: "Search by ID or name...",
    emptyMessage: (
      <span className="flex items-center gap-2">
        No licenses found.
        <GoToButton
          path="/$id/app/licenses"
          params={{ id: keygen.config.id }}
          label="View licenses"
        />
      </span>
    ),
  },
  group: {
    getLabel: getGroupLabel as (option: BaseOption) => string,
    placeholder: "Select a group...",
    searchPlaceholder: "Search by ID or name...",
    emptyMessage: (
      <span className="flex items-center gap-2">
        No groups found.
        <GoToButton
          path="/$id/app/groups"
          params={{ id: keygen.config.id }}
          label="View groups"
        />
      </span>
    ),
  },
  user: {
    // TODO(cazden) Update when Users resource is available
    getLabel: (option: BaseOption) => option.id,
    placeholder: "Select an owner...",
    searchPlaceholder: "Search by ID or email...",
    emptyMessage: (
      <span className="flex items-center gap-2">
        No users found.
        {/* <GoToButton
          path="/$id/app/users"
          params={{ id: keygen.config.id }}
          label="View users"
        /> */}
      </span>
    ),
  },
}

function getDefaultLabel<T extends BaseOption>(option: T): string {
  if (
    "attributes" in option &&
    typeof (option as NamedOption).attributes?.name === "string"
  ) {
    return (option as NamedOption).attributes.name
  }
  return option.id
}

interface SearchSelectProps<T extends BaseOption> {
  value: string | null | undefined
  onChange: (value: string | null) => void
  options: T[]
  resource?: ResourceType
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string | React.ReactElement
  allowClear?: boolean
  clearLabel?: string
  invalid?: boolean
  truncate?: TruncateStyle
  truncateLength?: number
  className?: string
}

export default function SearchSelect<T extends BaseOption>({
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
  truncate,
  truncateLength = 36,
  className,
}: SearchSelectProps<T>) {
  const config = resource ? resourceConfigs[resource] : null

  const getLabel = config?.getLabel ?? getDefaultLabel

  const resolvedPlaceholder =
    placeholder ?? config?.placeholder ?? "Select one..."
  const resolvedSearchPlaceholder =
    searchPlaceholder ?? config?.searchPlaceholder ?? "Search by ID or name..."
  const resolvedEmptyMessage =
    emptyMessage ?? config?.emptyMessage ?? "No results found"

  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)

  const format = useMemo(
    () =>
      truncate ? truncator(truncate, { maxLength: truncateLength }) : null,
    [truncate, truncateLength],
  )

  const labelMap = useMemo(
    () => new Map(options.map((o) => [o.id, getLabel(o)])),
    [options, getLabel],
  )

  const visibleOptions = useMemo(() => {
    const lowerQuery = query.toLowerCase()
    return options.filter(
      (option) =>
        getLabel(option).toLowerCase().includes(lowerQuery) ||
        option.id.toLowerCase().includes(lowerQuery),
    )
  }, [query, options, getLabel])

  const selectedLabel = value ? labelMap.get(value) : null
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

              {visibleOptions.length > 0 ? (
                visibleOptions.map((option) => {
                  const label = getLabel(option)
                  const displayOptionLabel = format ? format(label) : label

                  return (
                    <CommandItem
                      key={option.id}
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
