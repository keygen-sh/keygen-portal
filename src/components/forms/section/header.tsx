import { cn } from "@/lib/utils"

import { DialogHeader } from "@/components/ui/dialog"

type FormsSectionHeaderVariant = "modal" | "page"

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
