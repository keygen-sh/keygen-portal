import { cn } from "@/lib/utils"

interface FormsSectionColumnProps {
  children: React.ReactNode
  className?: string
}

export default function FormsSectionColumn({
  children,
  className,
}: FormsSectionColumnProps) {
  return (
    <div className={cn("min-w-0 flex-1 space-y-4", className)}>{children}</div>
  )
}
