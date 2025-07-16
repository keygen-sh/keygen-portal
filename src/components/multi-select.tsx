import { useState, useRef, KeyboardEvent, useMemo } from "react"
import { useFormContext } from "react-hook-form"

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

interface MultiSelectInputProps {
  name: string
  options: Option[]
  wildcard?: string
  placeholder?: string
  disabled?: boolean
}

export default function MultiSelectInput({
  name,
  options,
  wildcard,
  placeholder = "Choose...",
  disabled,
}: MultiSelectInputProps) {
  const { watch, setValue } = useFormContext()
  const selected: string[] = watch(name) ?? []

  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)

  const visibleOptions = useMemo(
    () =>
      options.filter(({ label }) =>
        label.toLowerCase().includes(query.toLowerCase()),
      ),
    [query, options],
  )

  const toggle = (value: string, focus = true) => {
    const isActive = selected.includes(value)
    let next: string[]

    if (wildcard && value === wildcard) {
      next = []
    } else {
      next = isActive
        ? selected.filter((v) => v !== value)
        : [...selected, value]
    }
    setValue(name, next, { shouldValidate: true })
    setQuery("")
    if (focus) inputRef.current?.focus()
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
            "data-[state=open]:border-content-subdued [&_[data-radix-scroll-area-thumb]]:bg-content-muted",
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
                {value} <span className="ml-1">&times;</span>
              </Badge>
            ))}

            <Input
              ref={inputRef}
              value={query}
              disabled={disabled}
              placeholder={selected.length ? "" : placeholder}
              fieldSize={"sm"}
              className="h-5 flex-1 border-none"
              onChange={(e) => {
                setQuery(e.target.value)
                setOpen(true)
              }}
              onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
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
            <ScrollArea className="h-64">
              {visibleOptions.map(({ label, value }) => (
                <CommandItem
                  key={value}
                  onSelect={() => toggle(value)}
                  className="cursor-pointer"
                >
                  <Checkbox
                    checked={
                      value === wildcard
                        ? selected.length === 0
                        : selected.includes(value)
                    }
                    onCheckedChange={() => toggle(value, false)}
                    className="mr-2"
                  />
                  {label}
                </CommandItem>
              ))}
            </ScrollArea>

            <CommandEmpty>No results.</CommandEmpty>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
