import { useState, useRef, KeyboardEvent, useMemo } from "react"
import { Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"
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
import { useMobile } from "@/hooks/use-mobile"

const NONE = "__NONE__"

interface Option {
  label: string
  value: string
}

interface RequiredOption extends Option {
  tooltip: string
}

interface MultiSelectProps {
  value: string[] | null | undefined
  onChange: (value: string[] | null) => void
  options: Option[]
  includeNone?: boolean
  includeWildcard?: boolean
  requiredOptions?: RequiredOption[]
  placeholder?: string
  disabled?: boolean
  autoFocus?: boolean
  disabledTooltip?: string
  className?: string
}

export default function MultiSelect({
  value,
  onChange,
  options,
  includeNone,
  includeWildcard,
  requiredOptions = [],
  placeholder = "Choose...",
  disabled,
  autoFocus,
  disabledTooltip,
  className,
}: MultiSelectProps) {
  const items = value ?? []
  const hasNoneOption = !!includeNone && requiredOptions.length === 0
  const isNoneSelected = hasNoneOption && value != null && value.length === 0
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)

  const requiredSet = useMemo(
    () => new Set(requiredOptions.map((o) => o.value)),
    [requiredOptions],
  )
  const requiredTooltipMap = useMemo(
    () => new Map(requiredOptions.map((o) => [o.value, o.tooltip])),
    [requiredOptions],
  )
  const labelMap = useMemo(
    () => new Map(options.map((o) => [o.value, o.label])),
    [options],
  )
  const normalizedOptions = useMemo(() => {
    const base = options.slice()
    if (includeWildcard && !base.some((o) => o.value === "*")) {
      base.unshift({ label: "*", value: "*" })
    }
    return base
  }, [options, includeWildcard])

  const visibleOptions = useMemo(
    () =>
      normalizedOptions.filter((option) =>
        option.label.toLowerCase().includes(query.toLowerCase()),
      ),
    [query, normalizedOptions],
  )

  const emit = (next: string[] | null, focus = true) => {
    onChange(next)
    setQuery("")
    if (focus) inputRef.current?.focus()
  }

  const toggle = (value: string, focus = true) => {
    if (value === NONE) {
      emit(isNoneSelected ? null : [], focus)
      return
    }

    if (requiredSet.has(value)) return

    if (includeWildcard && value === "*") {
      emit(items.includes(value) ? null : [value], focus)
      return
    }

    const base = items.filter((v) => !(includeWildcard && v === "*"))
    const isActive = base.includes(value)
    const next = isActive ? base.filter((v) => v !== value) : [...base, value]
    emit(next.length === 0 ? null : next, focus)
  }

  const remove = (value: string) => {
    if (requiredSet.has(value)) return
    toggle(value, open)
  }

  const content = (
    <Popover modal open={!disabled && open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <ScrollArea
          ref={triggerRef}
          onPointerDownCapture={(e) => {
            if (
              e.target !== triggerRef.current &&
              e.target !== inputRef.current
            )
              return

            e.stopPropagation()
            inputRef.current?.focus()
          }}
          onClickCapture={(e) => {
            if (
              e.target !== triggerRef.current &&
              e.target !== inputRef.current
            )
              return
            e.stopPropagation()
          }}
          type="always"
          scrollHideDelay={0}
          className={cn(
            "max-h-48 overflow-y-auto rounded-md border border-accent transition-colors duration-300 focus-within:border-content-subdued",
            "**:data-radix-scroll-area-thumb:bg-content-muted data-[state=open]:border-content-subdued",
            className,
          )}
        >
          <div className="flex min-h-9 w-full flex-wrap items-center gap-x-2 gap-y-2 p-2 text-sm">
            {requiredOptions.map(({ label, value, tooltip }) => (
              <Tooltip key={value}>
                <TooltipTrigger asChild>
                  <Badge className="h-5 cursor-default text-content-subdued">
                    {label}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent className="text-conent-muted max-w-64 bg-background-5 text-pretty">
                  {tooltip}
                </TooltipContent>
              </Tooltip>
            ))}
            {isNoneSelected && (
              <Badge
                className="h-5 cursor-pointer text-content-muted"
                onClick={(e) => {
                  e.stopPropagation()
                  toggle(NONE, open)
                }}
              >
                None <span className="ml-1">&times;</span>
              </Badge>
            )}
            {items
              .filter((v) => !requiredSet.has(v))
              .map((value) => (
                <Badge
                  key={value}
                  className="h-5 cursor-pointer text-content-muted"
                  onClick={(e) => {
                    e.stopPropagation()
                    remove(value)
                  }}
                >
                  {labelMap.get(value) ?? value}{" "}
                  <span className="ml-1">&times;</span>
                </Badge>
              ))}

            <Input
              ref={inputRef}
              value={query}
              disabled={disabled}
              autoFocus={autoFocus}
              placeholder={
                items.length || isNoneSelected || requiredOptions.length
                  ? ""
                  : placeholder
              }
              fieldSize="sm"
              className="h-5 flex-1 border-none"
              onChange={(e) => {
                setQuery(e.target.value)
                setOpen(true)
              }}
              onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Tab") {
                  setOpen(false)
                  return
                }

                if (e.key === "Backspace" && !query) {
                  if (isNoneSelected) {
                    toggle(NONE, open)
                  } else if (items.length) {
                    remove(items[items.length - 1])
                  }
                } else if (e.key === "Escape") {
                  setOpen(false)
                  setQuery("")
                }
              }}
              onFocus={() => setOpen(true)}
            />
          </div>
        </ScrollArea>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="min-w-64 p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <Command shouldFilter={false}>
          <CommandList>
            <ScrollArea
              className={cn(
                visibleOptions.length + (hasNoneOption ? 1 : 0) > 5 && "h-48",
              )}
            >
              {hasNoneOption && (
                <CommandItem
                  tabIndex={-1}
                  onSelect={() => toggle(NONE)}
                  className="cursor-pointer"
                >
                  <Checkbox
                    checked={isNoneSelected}
                    className="pointer-events-none mr-2"
                  />
                  None
                </CommandItem>
              )}
              {visibleOptions.map(({ label, value }) => {
                const isRequired = requiredSet.has(value)

                return (
                  <CommandItem
                    key={value}
                    tabIndex={-1}
                    onSelect={() => toggle(value)}
                    className={cn(
                      isRequired ? "cursor-default" : "cursor-pointer",
                    )}
                  >
                    <Checkbox
                      checked={isRequired || items.includes(value)}
                      disabled={isRequired}
                      className="pointer-events-none mr-2"
                    />
                    {label}
                    {isRequired && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span
                            className="ml-auto flex items-center"
                            onClick={(e) => e.stopPropagation()}
                            onPointerDown={(e) => e.stopPropagation()}
                          >
                            <Info className="size-3.5 text-muted-foreground" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent
                          side="right"
                          sideOffset={8}
                          className="pointer-events-none max-w-56 bg-background-5 text-pretty text-content-muted"
                        >
                          {requiredTooltipMap.get(value)}
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </CommandItem>
                )
              })}
            </ScrollArea>

            <CommandEmpty className="p-2 text-sm text-content-normal">
              No results found
            </CommandEmpty>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )

  if (disabled && disabledTooltip) {
    return (
      <DisabledTooltip tooltip={disabledTooltip}>{content}</DisabledTooltip>
    )
  }

  return content
}

function DisabledTooltip({
  tooltip,
  children,
}: {
  tooltip: string
  children: React.ReactNode
}) {
  const isMobile = useMobile()
  const [open, setOpen] = useState(false)

  const trigger = (
    <span
      tabIndex={0}
      className={cn(
        "block rounded-md transition-colors",
        open ? "bg-background-1" : "hover:bg-background-1",
      )}
    >
      {children}
    </span>
  )

  if (isMobile) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>
        <PopoverContent className="max-w-64 bg-background-4 text-pretty text-content-muted">
          {tooltip}
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <Tooltip open={open} onOpenChange={setOpen}>
      <TooltipTrigger asChild>{trigger}</TooltipTrigger>
      <TooltipContent className="max-w-64 bg-background-4 text-pretty text-content-muted">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  )
}
