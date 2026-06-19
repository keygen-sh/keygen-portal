import { cn } from "@/lib/utils"

import { DialogHeader } from "@/components/ui/dialog"

type FormsSectionHeaderVariant = "modal" | "page" | "auth"

interface FormsSectionHeaderProps {
  variant?: FormsSectionHeaderVariant
  children: React.ReactNode
  className?: string
}

export default function FormsSectionHeader({
  variant = "modal",
  children,
  className,
}: FormsSectionHeaderProps) {
  if (variant === "page") {
    return (
      <div
        className={cn(
          "flex h-fit flex-col items-start border-b border-accent p-4 text-left",
          className,
        )}
      >
        {children}
      </div>
    )
  }

  if (variant === "auth") {
    return (
      <h1
        className={cn(
          "bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text font-owners-wide text-2xl font-medium text-transparent select-none",
          className,
        )}
      >
        {children}
      </h1>
    )
  }

  return (
    <DialogHeader
      className={cn(
        "flex h-fit flex-col items-start border-b border-accent p-4 text-left",
        className,
      )}
    >
      {children}
    </DialogHeader>
  )
}
