import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer relative inline-flex h-[var(--h)] w-8 shrink-0 items-center rounded-full border border-transparent p-[var(--p)] shadow-xs transition-all outline-none [--h:1.15rem] [--p:2px] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-background-3 dark:data-[state=unchecked]:bg-input/80",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none absolute top-1/2 left-[var(--p)] size-[calc(var(--h)-2*var(--p))] -translate-y-1/2 rounded-full ring-0 transition-all will-change-transform data-[state=checked]:left-[calc(100%-var(--p))] data-[state=checked]:-translate-x-full data-[state=checked]:bg-background data-[state=unchecked]:bg-content-disabled dark:data-[state=checked]:bg-primary-foreground dark:data-[state=unchecked]:bg-foreground",
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
