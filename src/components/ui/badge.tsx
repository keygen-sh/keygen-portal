import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md px-1 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default: "font-normal bg-background-2 text-content-loud rounded-[3px]",
        secondary: "font-normal bg-secondary/20 text-secondary rounded-[3px]",
        destructive:
          "font-normal bg-destructive/20 text-destructive rounded-[3px]",
        warning: "font-normal bg-warning/20 text-warning rounded-[3px]",
        success: "font-normal bg-primary/20 text-primary rounded-[3px]",
        outline: "border border-accent text-content-loud",
        disabled:
          "font-normal bg-background-1 text-content-subdued rounded-[3px]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

export type BadgeVariant = VariantProps<typeof badgeVariants>["variant"]

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
