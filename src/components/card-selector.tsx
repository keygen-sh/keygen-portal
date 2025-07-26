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

export function CardSelector<T>({
  options,
  value,
  onChange,
  horizontal = true,
  className,
}: {
  options: CardOption<T>[]
  value: T | undefined
  onChange: (v: T) => void
  horizontal?: boolean
  className?: string
}) {
  const isMobile = useMobile()
  const refs = useRef<(HTMLDivElement | null)[]>([])
  const index = options.findIndex((o) => o.value === value)

  const move = useCallback(
    (direction: number) => {
      if (index === -1) return
      const next = (index + direction + options.length) % options.length
      refs.current[next]?.focus()
    },
    [index, options.length],
  )

  return (
    <div
      role="radiogroup"
      className={cn("flex flex-col gap-4 md:flex-row", className)}
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
      {options.map((option, i) => (
        <SelectableCard
          key={String(option.value)}
          ref={(element) => {
            refs.current[i] = element
          }}
          selected={value === option.value}
          onSelect={() => onChange(option.value)}
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
      ))}
    </div>
  )
}

const SelectableCard = React.forwardRef<
  HTMLDivElement,
  { selected: boolean; onSelect: () => void; children: React.ReactNode }
>(({ selected, onSelect, children }, ref) => {
  const activate = (e: React.MouseEvent | React.KeyboardEvent) => {
    if ("key" in e && e.key !== " " && e.key !== "Enter") return
    e.preventDefault()
    onSelect()
  }

  return (
    <Card
      ref={ref}
      role="radio"
      tabIndex={0}
      onClick={activate}
      onKeyDown={activate}
      className={cn(
        "w-full cursor-pointer rounded-lg bg-background p-0.5 transition-colors duration-200 md:w-60",
        "focus-visible:ring-2 focus-visible:ring-content-subdued focus-visible:outline-none",
        selected && "bg-gradient-to-r from-primary to-secondary",
      )}
    >
      {children}
    </Card>
  )
})
SelectableCard.displayName = "SelectableCard"
