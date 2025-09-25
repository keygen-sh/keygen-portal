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

type FieldHeaderVariant = "row" | "stacking"

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
        "flex w-full flex-col gap-2",
        variant === "row" && "md:flex-row md:items-center md:justify-between",
        className,
      )}
    >
      <div className="flex items-center gap-2">
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
                <Info className="size-4 pt-0.5 text-content-subdued" />
              </TooltipTrigger>
              <TooltipContent className="max-w-80 bg-background-4 text-pretty text-content-muted">
                {tooltip}
              </TooltipContent>
            </Tooltip>
          )
        )}
      </div>
      <div
        className={cn("w-full", variant === "row" && "md:max-w-48 md:min-w-48")}
      >
        {children}
      </div>
    </div>
  )
}
