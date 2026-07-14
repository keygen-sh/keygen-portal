import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import {
  Info,
  TriangleAlert,
  OctagonAlert,
  type LucideIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"

const noticeVariants = cva(
  "flex items-start gap-2 rounded-md p-3 text-pretty",
  {
    variants: {
      variant: {
        default: "bg-background-1 text-content-muted",
        primary: "bg-primary/20 text-primary",
        secondary: "bg-secondary/20 text-secondary",
        warning: "bg-warning/20 text-warning",
        destructive: "bg-destructive/20 text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

export type NoticeVariant = NonNullable<
  VariantProps<typeof noticeVariants>["variant"]
>

const noticeIcons: Record<NoticeVariant, LucideIcon> = {
  default: Info,
  primary: Info,
  secondary: Info,
  warning: TriangleAlert,
  destructive: OctagonAlert,
}

function Notice({
  className,
  variant = "default",
  children,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof noticeVariants>) {
  const Icon = noticeIcons[variant ?? "default"]

  return (
    <div className={cn(noticeVariants({ variant }), className)} {...props}>
      <Icon className="mt-0.5 size-4 shrink-0" />
      <div className="flex flex-col text-xs">{children}</div>
    </div>
  )
}

function NoticeTitle({ className, ...props }: React.ComponentProps<"strong">) {
  return <strong className={cn(className)} {...props} />
}

function NoticeDescription({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return <span className={cn("text-pretty", className)} {...props} />
}

Notice.Title = NoticeTitle
Notice.Description = NoticeDescription

export { Notice }
