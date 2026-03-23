import React, { useRef, useCallback } from "react"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
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

import { Info } from "lucide-react"

import { useMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

export interface CardOption<T> {
  value: T
  label?: string
  icon?: React.ReactNode
  tooltip?: string
}

type SingleProps<T> = {
  options: CardOption<T>[]
  value: T | undefined
  onChange: (value: T) => void
  multiple?: false
  columns?: number
  horizontal?: boolean
  className?: string
}
type MultipleProps<T> = {
  options: CardOption<T>[]
  value: T[]
  onChange: (value: T[]) => void
  multiple: true
  columns?: number
  horizontal?: boolean
  className?: string
}
type CardSelectorProps<T> = SingleProps<T> | MultipleProps<T>

export function CardSelector<T>({
  options,
  value,
  columns = 3,
  onChange,
  multiple = false,
  horizontal = true,
  className,
}: CardSelectorProps<T>): React.ReactElement {
  const isMobile = useMobile()
  const refs = useRef<(HTMLDivElement | null)[]>([])

  const index = multiple
    ? (() => {
        const array = Array.isArray(value) ? value : []
        if (array.length === 0) return -1
        return options.findIndex((option) => array.includes(option.value))
      })()
    : options.findIndex((option) => option.value === (value as T | undefined))

  const move = useCallback(
    (direction: number) => {
      if (index === -1) {
        const start = direction > 0 ? 0 : options.length - 1
        refs.current[start]?.focus()
        return
      }
      const next = (index + direction + options.length) % options.length
      refs.current[next]?.focus()
    },
    [index, options.length],
  )

  const isSelected = useCallback(
    (option: T) =>
      multiple
        ? Array.isArray(value) && value.includes(option)
        : (value as T | undefined) === option,
    [multiple, value],
  )

  const handleSelect = useCallback(
    (option: T) => {
      if (!multiple) {
        ;(onChange as (value: T) => void)(option)
        return
      }
      const current = Array.isArray(value) ? value : []
      const set = new Set(current)
      if (set.has(option)) {
        set.delete(option)
      } else {
        set.add(option)
      }
      ;(onChange as (value: T[]) => void)(Array.from(set))
    },
    [multiple, onChange, value],
  )

  return (
    <div
      role={multiple ? "group" : "radiogroup"}
      className={cn("grid grid-cols-1 gap-4 md:grid-cols-3", className)}
      style={{
        gridTemplateColumns: `repeat(${isMobile ? 1 : columns}, minmax(0,1fr))`,
      }}
      onKeyDown={(e) => {
        if (
          (horizontal && (e.key === "ArrowRight" || e.key === "ArrowLeft")) ||
          (!horizontal && (e.key === "ArrowDown" || e.key === "ArrowUp"))
        ) {
          e.preventDefault()
          move(e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1)
        }
      }}
    >
      {options.map((option, i) => {
        const selected = isSelected(option.value)

        return (
          <SelectableCard
            key={String(option.value)}
            ref={(element) => {
              refs.current[i] = element
            }}
            role={multiple ? "checkbox" : "radio"}
            selected={selected}
            onSelect={() => handleSelect(option.value)}
          >
            <div className="space-y-4 rounded-[inherit] bg-background p-4">
              {option.icon && (
                <CardHeader className="p-0">
                  <CardTitle>{option.icon}</CardTitle>
                </CardHeader>
              )}

              <CardContent className="flex items-center gap-2 p-0">
                <p className="text-lg font-medium text-content-loud md:text-base">
                  {option.label}
                </p>

                {option.tooltip && (
                  <>
                    {isMobile ? (
                      <Popover>
                        <PopoverTrigger onClick={(e) => e.stopPropagation()}>
                          <Info className="size-5 text-content-subdued" />
                        </PopoverTrigger>
                        <PopoverContent className="ml-2 max-w-64 bg-background-4 text-content-muted">
                          {option.tooltip}
                        </PopoverContent>
                      </Popover>
                    ) : (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="size-4 pt-0.5 text-content-subdued" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-64 bg-background-4 text-content-muted">
                          {option.tooltip}
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </>
                )}
              </CardContent>
            </div>
          </SelectableCard>
        )
      })}
    </div>
  )
}

const SelectableCard = React.forwardRef<
  HTMLDivElement,
  {
    role?: "radio" | "checkbox"
    selected: boolean
    onSelect: () => void
    children: React.ReactNode
  }
>(({ role = "radio", selected, onSelect, children }, ref) => {
  const activate = (e: React.MouseEvent | React.KeyboardEvent) => {
    if ("key" in e && e.key !== " " && e.key !== "Enter") return
    e.preventDefault()
    onSelect()
  }

  return (
    <Card
      ref={ref}
      role={role}
      aria-checked={selected}
      tabIndex={0}
      onClick={activate}
      onKeyDown={activate}
      className={cn(
        "w-full min-w-0 cursor-pointer rounded-lg bg-background p-0.5 transition-colors duration-300 md:max-w-72",
        "group focus-visible:ring-2 focus-visible:ring-content-subdued focus-visible:outline-none",
        selected && "bg-linear-to-r from-primary to-secondary",
      )}
      data-selected={selected ? "true" : "false"}
    >
      {children}
    </Card>
  )
})
SelectableCard.displayName = "SelectableCard"
