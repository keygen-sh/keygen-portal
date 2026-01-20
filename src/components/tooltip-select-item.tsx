import * as React from "react"

import * as SelectPrimitive from "@radix-ui/react-select"
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

interface TooltipSelectItemProps
  extends React.ComponentProps<typeof SelectPrimitive.Item> {
  tooltip: string
}

export default function TooltipSelectItem({
  className,
  children,
  tooltip,
  ...props
}: TooltipSelectItemProps) {
  const isMobile = useMobile()

  const tooltipContent = <span className="max-w-64 text-pretty">{tooltip}</span>

  if (isMobile) {
    return (
      <SelectPrimitive.Item
        data-slot="select-item"
        className={cn(
          "relative flex w-full cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none hover:bg-accent focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
          className,
        )}
        {...props}
      >
        <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
        <Popover>
          <PopoverTrigger asChild>
            <span
              className="ml-auto flex items-center"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <Info className="size-5 text-muted-foreground" />
            </span>
          </PopoverTrigger>
          <PopoverContent
            side="right"
            className="max-w-64 bg-accent text-pretty text-content-loud"
          >
            {tooltipContent}
          </PopoverContent>
        </Popover>
      </SelectPrimitive.Item>
    )
  }

  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex w-full cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none hover:bg-accent focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className="ml-auto flex items-center"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <Info className="size-3.5 text-muted-foreground" />
          </span>
        </TooltipTrigger>
        <TooltipContent
          side="right"
          sideOffset={8}
          className="pointer-events-none max-w-56 bg-accent text-pretty text-content-loud"
        >
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    </SelectPrimitive.Item>
  )
}
