import { useRef, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover"

import { cn } from "@/lib/utils"

export interface SuggestOption {
  value: string
  label?: string
  description?: string
  badge?: string
}

interface SuggestInputProps {
  value: string
  onChange: (value: string) => void
  options: SuggestOption[]
  placeholder?: string
  emptyMessage?: string
  disabled?: boolean
  invalid?: boolean
  autoFocus?: boolean
  className?: string
}

export default function SuggestInput({
  value,
  onChange,
  options,
  placeholder,
  emptyMessage = "No suggestions",
  disabled,
  invalid,
  autoFocus,
  className,
}: SuggestInputProps) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)

  const close = () => {
    setOpen(false)
    setActiveIndex(-1)
  }

  const select = (next: string) => {
    onChange(next)
    close()
    inputRef.current?.focus()
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      if (open) {
        e.preventDefault()
        close()
      }
      return
    }

    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault()
      if (!open) {
        setOpen(true)
        return
      }
      if (!options.length) return
      setActiveIndex((index) => {
        if (e.key === "ArrowDown") return (index + 1) % options.length
        return index <= 0 ? options.length - 1 : index - 1
      })
      return
    }

    // intercept enter for highlighted option, otherwise keypress falls
    // through and the surrounding form submits the typed value as-is.
    if (e.key === "Enter" && open && options[activeIndex]) {
      e.preventDefault()
      select(options[activeIndex].value)
    }
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setActiveIndex(-1)
      }}
    >
      <PopoverAnchor asChild>
        <div className="w-full">
          <Input
            ref={inputRef}
            value={value}
            disabled={disabled}
            autoFocus={autoFocus}
            placeholder={placeholder}
            autoComplete="off"
            aria-invalid={invalid}
            role="combobox"
            aria-expanded={open}
            className={className}
            onChange={(e) => {
              onChange(e.target.value)
              setActiveIndex(-1)
              if (!open) setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            onClick={() => setOpen(true)}
            onKeyDown={onKeyDown}
          />
        </div>
      </PopoverAnchor>

      <PopoverContent
        align="start"
        sideOffset={4}
        className="w-(--radix-popover-trigger-width) p-1 pb-1.5"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={(e) => {
          const target = e.detail.originalEvent.target as Node | null
          if (target && inputRef.current?.contains(target)) {
            e.preventDefault()
          }
        }}
      >
        {options.length > 0 ? (
          <ScrollArea className={cn(options.length > 5 && "h-48")}>
            <div className="space-y-px" role="listbox">
              {options.map((option, index) => (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={index === activeIndex}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => select(option.value)}
                  className={cn(
                    "flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm",
                    index === activeIndex && "bg-accent",
                  )}
                >
                  <span className="mb-0.5 min-w-0 truncate text-content-loud">
                    {option.label ?? option.value}
                  </span>
                  {option.badge && (
                    <Badge variant="secondary" className="shrink-0">
                      {option.badge}
                    </Badge>
                  )}
                  {option.description && (
                    <span className="ml-auto shrink-0 truncate font-mono text-xs text-content-subdued">
                      {option.description}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex h-9 items-center px-2 text-sm text-content-subdued select-none">
            {emptyMessage}
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
