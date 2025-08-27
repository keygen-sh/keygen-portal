import { cn } from "@/lib/utils"

interface PropertySectionProps {
  title: string
  children?: React.ReactNode
  className?: string
}

export default function PropertySection({
  title,
  children,
  className,
}: PropertySectionProps): React.ReactElement {
  return (
    <section className={cn("w-full", className)}>
      <h3 className="text-xs font-semibold text-content-muted">{title}</h3>
      <div className="flex flex-col gap-3 pt-3">{children}</div>
    </section>
  )
}
