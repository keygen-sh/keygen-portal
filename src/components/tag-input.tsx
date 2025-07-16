import { useState, useRef, useMemo, KeyboardEvent } from "react"
import { useFormContext } from "react-hook-form"

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
}

export default function TagInput({
  name,
  options,
  placeholder = "Add item...",
  delimiters = ["Enter", "Tab", ","],
  disabled,
}: TagInputProps) {
  const { watch, setValue } = useFormContext()
  const tags: string[] = watch(name) ?? []

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
            "flex min-h-9 w-full flex-wrap space-y-2 space-x-2 rounded-md border px-2 pt-2 text-sm transition-colors duration-300 focus-within:border-content-subdued",
            "data-[state=open]:border-content-subdued [&_[data-radix-scroll-area-thumb]]:bg-content-muted",
          )}
        >
          {tags.map((tag) => (
            <Badge
              key={tag}
              className="cursor-pointer text-content-muted"
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
            placeholder={tags.length ? "" : placeholder}
            fieldSize={"sm"}
            className="max-h-6 flex-1 border-none p-0 leading-tight"
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
              <CommandEmpty className="text flex px-2 py-3 text-xs text-nowrap">
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
