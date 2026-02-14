import { cn } from "@/lib/utils"

import { DialogDescription } from "@/components/ui/dialog"

type FormsSectionDescriptionVariant = "modal" | "page"

interface FormsSectionDescriptionProps {
  variant?: FormsSectionDescriptionVariant
  children: React.ReactNode
  className?: string
}

export default function FormsSectionDescription({
  variant = "modal",
  children,
  className,
}: FormsSectionDescriptionProps) {
  if (variant === "page") {
    return (
      <p
        className={cn(
          "flex items-center space-x-1 text-xs text-muted-foreground",
          className,
        )}
      >
        {children}
      </p>
    )
  }

  return (
    <DialogDescription
      className={cn(
        "flex items-center space-x-1 text-xs text-muted-foreground",
        className,
      )}
    >
      {children}
    </DialogDescription>
  )
}
