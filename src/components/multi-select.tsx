import { useState, useRef, KeyboardEvent, useMemo } from "react"
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

interface Option {
  label: string
  value: string
}
interface MultiSelectProps {
  value: string[]
  onChange: (value: string[]) => void
  options: Option[]
  wildcard?: string
  placeholder?: string
  disabled?: boolean
  autoFocus?: boolean
  className?: string
}

export default function MultiSelect({
  value,
  onChange,
  options,
  wildcard,
  placeholder = "Choose...",
  disabled,
  autoFocus,
  className,
}: MultiSelectProps) {
  const selected = value ?? []
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)

  const labelMap = useMemo(
    () => new Map(options.map((o) => [o.value, o.label])),
    [options],
  )
  const visibleOptions = useMemo(
    () =>
      options.filter((option) =>
        option.label.toLowerCase().includes(query.toLowerCase()),
      ),
    [query, options],
  )

  const setSelected = (next: string[], focus = true) => {
    onChange(next)
    setQuery("")
    if (focus) inputRef.current?.focus()
  }

  const toggle = (value: string, focus = true) => {
    const isActive = selected.includes(value)
    const next =
      wildcard && value === wildcard
        ? []
        : isActive
          ? selected.filter((v) => v !== value)
          : [...selected, value]
    setSelected(next, focus)
  }

  const remove = (value: string) => toggle(value, open)

  return (
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
            {selected.map((value) => (
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
              placeholder={selected.length ? "" : placeholder}
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

                if (e.key === "Backspace" && !query && selected.length) {
                  remove(selected[selected.length - 1])
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
            <ScrollArea className={cn(visibleOptions.length > 5 && "h-48")}>
              {visibleOptions.map(({ label, value }) => (
                <CommandItem
                  key={value}
                  tabIndex={-1}
                  onSelect={() => toggle(value)}
                  className="cursor-pointer"
                >
                  <Checkbox
                    checked={
                      wildcard && value === wildcard
                        ? selected.length === 0
                        : selected.includes(value)
                    }
                    className="pointer-events-none mr-2"
                  />
                  {label}
                </CommandItem>
              ))}
            </ScrollArea>

            <CommandEmpty className="p-2 text-sm text-content-normal">
              No results found
            </CommandEmpty>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
