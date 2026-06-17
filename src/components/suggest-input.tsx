import { useRef, useState } from "react"

import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover"

import { cn } from "@/lib/utils"

export interface SuggestOption {
  value: string
  label?: string
  description?: string
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

export function SuggestInput({
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
  const inputRef = useRef<HTMLInputElement>(null)

  const select = (next: string) => {
    onChange(next)
    setOpen(false)
    inputRef.current?.focus()
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
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
            className={className}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setOpen(true)}
            onClick={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Escape" && open) {
                e.preventDefault()
                setOpen(false)
              }
            }}
          />
        </div>
      </PopoverAnchor>

      <PopoverContent
        align="start"
        sideOffset={4}
        className="w-(--radix-popover-trigger-width) p-1"
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
            <div className="space-y-px">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => select(option.value)}
                  className="flex w-full cursor-pointer flex-col items-start rounded-sm px-2 py-1.5 text-left hover:bg-accent"
                >
                  <span className="text-sm text-content-loud">
                    {option.label ?? option.value}
                  </span>
                  {option.description && (
                    <span className="text-xs text-content-subdued">
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
