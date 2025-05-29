"use client"

import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"

import { cn } from "@/lib/utils"

function Separator({
  className,
  orientation = "horizontal",
  dashed = false,
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root> & {
  dashed?: boolean
}) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator-root"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        dashed
          ? "shrink-0 border border-dashed border-border data-[orientation=horizontal]:w-full data-[orientation=horizontal]:border-t data-[orientation=vertical]:h-full data-[orientation=vertical]:border-l"
          : "shrink-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        className,
      )}
      {...props}
    />
  )
}

export { Separator }
