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

import { cn, splitLastWord } from "@/lib/utils"

import { useMobile } from "@/hooks/use-mobile"

export type FieldVariant = "row" | "stacking" | "inline" | "none"
type TooltipVariant = "default" | "warning"

interface FieldHeaderProps {
  label: string
  tooltip?: string | null
  tooltipVariant?: TooltipVariant
  variant?: FieldVariant
  optional?: boolean
  hint?: string
  children: React.ReactNode
  className?: string
}

export default function FieldHeader({
  label,
  tooltip = null,
  tooltipVariant = "default",
  variant = "row",
  optional = false,
  hint,
  children,
  className,
}: FieldHeaderProps) {
  const isMobile = useMobile()

  const { head, tail } = splitLastWord(label)

  return (
    <div
      className={cn(
        variant !== "none" && "flex w-full flex-col gap-2",
        variant === "row" && "md:flex-row md:items-center md:justify-between",
        variant === "inline" && "flex-row items-center justify-between",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="group flex items-center gap-2">
          <label className="inline text-sm text-content-muted">
            {head && <>{head} </>}
            <span className="inline-flex gap-2 whitespace-nowrap">
              {tail}
              {tooltip && (
                <>
                  <span className="inline-flex md:hidden">
                    <Popover>
                      <PopoverTrigger
                        onClick={(e) => e.stopPropagation()}
                        asChild
                      >
                        <Info
                          className={cn(
                            "inline size-5",
                            tooltipVariant === "warning"
                              ? "text-destructive"
                              : "text-content-subdued",
                          )}
                        />
                      </PopoverTrigger>
                      <PopoverContent className="m-1 max-w-64 bg-background-4 text-pretty text-content-muted">
                        {tooltip}
                      </PopoverContent>
                    </Popover>
                  </span>
                  <span className="hidden md:inline-flex">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info
                          className={cn(
                            "inline size-4 self-center transition-all duration-200",
                            tooltipVariant === "warning"
                              ? "text-destructive"
                              : "translate-x-2 text-content-subdued opacity-0 group-hover:translate-x-0 group-hover:opacity-100 data-[state=delayed-open]:translate-x-0 data-[state=delayed-open]:opacity-100 data-[state=open]:translate-x-0 data-[state=open]:opacity-100",
                          )}
                        />
                      </TooltipTrigger>
                      <TooltipContent className="m-1 max-w-80 bg-background-4 text-pretty text-content-muted">
                        {tooltip}
                      </TooltipContent>
                    </Tooltip>
                  </span>
                </>
              )}
            </span>
          </label>
        </div>
        {(hint || optional) && (isMobile || variant === "stacking") && (
          <span className="text-xs text-content-subdued">
            {hint ?? "Optional"}
          </span>
        )}
      </div>

      <div
        className={cn(
          variant !== "none" && "w-full",
          variant === "row" && "md:w-48!",
          variant === "inline" && "w-auto",
        )}
      >
        {children}
      </div>
    </div>
  )
}
