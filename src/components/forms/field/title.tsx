import { cn } from "@/lib/utils"

interface FormsFieldTitleProps {
  children: React.ReactNode
  className?: string
}

export default function FormsFieldTitle({
  children,
  className,
}: FormsFieldTitleProps) {
  return <div className={cn("m-4 md:mb-6", className)}>{children}</div>
}
