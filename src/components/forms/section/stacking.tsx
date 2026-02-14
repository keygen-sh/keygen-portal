import { cn } from "@/lib/utils"

interface FormsSectionStackingProps {
  title?: string
  children: React.ReactNode
  className?: string
}

export default function FormsSectionStacking({
  title,
  children,
  className,
}: FormsSectionStackingProps) {
  return (
    <div className={cn("space-y-6 md:w-full", className)}>
      {title && (
        <h2 className="text-sm font-medium text-content-loud/90">{title}</h2>
      )}
      {children}
    </div>
  )
}
