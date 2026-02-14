import { cn } from "@/lib/utils"

import { DialogTitle } from "@/components/ui/dialog"

type FormsSectionTitleVariant = "modal" | "page"

interface FormsSectionTitleProps {
  variant?: FormsSectionTitleVariant
  children: React.ReactNode
  className?: string
}

export default function FormsSectionTitle({
  variant = "modal",
  children,
  className,
}: FormsSectionTitleProps) {
  if (variant === "page") {
    return (
      <h2
        className={cn("w-full text-lg leading-none font-semibold", className)}
      >
        {children}
      </h2>
    )
  }

  return (
    <DialogTitle
      className={cn("w-full text-lg leading-none font-semibold", className)}
    >
      {children}
    </DialogTitle>
  )
}
