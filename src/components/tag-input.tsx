import { useState, useRef, useMemo, KeyboardEvent } from "react"
import { useFormContext, useWatch } from "react-hook-form"

import { cn } from "@/lib/utils"

import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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

interface TagInputProps {
  name: string
  options?: string[]
  placeholder?: string
  delimiters?: string[]
  disabled?: boolean
  autoFocus?: boolean
  className?: string
}

export default function TagInput({
  name,
  options,
  placeholder = "Add item...",
  delimiters = ["Enter", "Tab", ","],
  disabled,
  autoFocus,
  className,
}: TagInputProps) {
  const { setValue } = useFormContext()
  const watchedTags = useWatch({ name }) as string[] | undefined
  const tags = useMemo(() => watchedTags ?? [], [watchedTags])

  const [draft, setDraft] = useState("")
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)

  const filtered = useMemo(() => {
    if (!options) return []
    return options
      .filter(
        (option) =>
          !tags.includes(option) &&
          option.toLowerCase().includes(draft.toLowerCase()),
      )
      .slice(0, 10)
  }, [draft, options, tags])

  const add = (value: string) => {
    const trimmed = value.trim()
    if (!trimmed || tags.includes(trimmed)) return
    setValue(name, [...tags, trimmed], { shouldValidate: true })
    setDraft("")
  }

  const remove = (value: string) => {
    setValue(
      name,
      tags.filter((t) => t !== value),
      { shouldValidate: true },
    )
  }

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (delimiters.includes(e.key) && e.key !== "Tab") {
      e.preventDefault()
      add(draft)
    } else if (e.key === "Tab") {
      if (draft.trim()) {
        e.preventDefault()
        add(draft)
      }
      return
    } else if (e.key === "Backspace" && !draft && tags.length) {
      remove(tags[tags.length - 1])
    }
  }

  return (
    <Popover
      modal
      open={!disabled && open}
      onOpenChange={(value) => setOpen(value)}
    >
      <PopoverTrigger asChild>
        <div
          ref={triggerRef}
          className={cn(
            "flex min-h-9 w-full flex-wrap gap-x-2 gap-y-2 rounded-md border p-2 text-sm transition-colors duration-300 focus-within:border-content-subdued",
            "**:data-radix-scroll-area-thumb:bg-content-muted data-[state=open]:border-content-subdued",
            className,
          )}
        >
          {tags.map((tag) => (
            <Badge
              key={tag}
              className="h-5 cursor-pointer text-content-muted"
              onClick={(e) => {
                e.stopPropagation()
                if (disabled) return

                remove(tag)
              }}
            >
              {tag} <span className="ml-1">&times;</span>
            </Badge>
          ))}

          <Input
            ref={inputRef}
            value={draft}
            disabled={disabled}
            autoFocus={autoFocus}
            placeholder={tags.length ? "" : placeholder}
            fieldSize={"sm"}
            className="h-5 flex-1 border-none"
            onChange={(e) => {
              setDraft(e.target.value)
              if (!open) setOpen(true)
            }}
            onKeyDown={handleKey}
          />
        </div>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="min-w-64 p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <Command shouldFilter={false}>
          <CommandList>
            {filtered.map((option) => (
              <CommandItem
                key={option}
                onSelect={() => {
                  add(option)
                  setOpen(false)
                  inputRef.current?.focus()
                }}
              >
                {option}
              </CommandItem>
            ))}

            {filtered.length === 0 && (
              <CommandEmpty className="flex px-2 py-3 text-xs text-nowrap">
                <span>No matches. Press </span>
                <kbd className="mx-2 rounded-[3px] border-t border-content-subdued bg-background-5 px-1 text-xs text-nowrap text-content-muted">
                  Enter
                </kbd>{" "}
                <span>to add new {name}.</span>
              </CommandEmpty>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
