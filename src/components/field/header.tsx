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

import { cn } from "@/lib/utils"

import { useMobile } from "@/hooks/use-mobile"

type FieldHeaderVariant = "row" | "stacking" | "inline" | "none"

interface FieldHeaderProps {
  label: string
  tooltip?: string | null
  variant?: FieldHeaderVariant
  children: React.ReactNode
  className?: string
}

export default function FieldHeader({
  label,
  tooltip = null,
  variant = "row",
  children,
  className,
}: FieldHeaderProps) {
  const isMobile = useMobile()

  return (
    <div
      className={cn(
        variant !== "none" && "flex w-full flex-col gap-2",
        variant === "row" && "md:flex-row md:items-center md:justify-between",
        variant === "inline" && "flex-row items-center justify-between",
        className,
      )}
    >
      <div className="group flex items-center gap-2">
        <label className="text-sm text-content-muted">{label}</label>
        {isMobile && tooltip ? (
          <Popover>
            <PopoverTrigger onClick={(e) => e.stopPropagation()}>
              <Info className="size-5 text-content-subdued" />
            </PopoverTrigger>
            <PopoverContent className="ml-2 max-w-64 bg-background-4 text-pretty text-content-muted">
              {tooltip}
            </PopoverContent>
          </Popover>
        ) : (
          tooltip && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="pointer-events-none size-4 translate-x-2 pt-0.5 text-content-subdued opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:translate-x-0 group-hover:opacity-100 data-[state=delayed-open]:pointer-events-auto data-[state=delayed-open]:translate-x-0 data-[state=delayed-open]:opacity-100 data-[state=open]:pointer-events-auto data-[state=open]:translate-x-0 data-[state=open]:opacity-100" />
              </TooltipTrigger>
              <TooltipContent className="max-w-80 bg-background-4 text-pretty text-content-muted">
                {tooltip}
              </TooltipContent>
            </Tooltip>
          )
        )}
      </div>
      <div
        className={cn(
          variant !== "none" && "w-full",
          variant === "row" && "md:max-w-48 md:min-w-48",
          variant === "inline" && "w-auto",
        )}
      >
        {children}
      </div>
    </div>
  )
}
