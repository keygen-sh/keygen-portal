import { cn } from "@/lib/utils"

interface PageFooterProps {
  className?: string
  children: React.ReactNode
}

export default function PageFooter({
  className,
  children,
}: PageFooterProps): React.ReactNode {
  return (
    <footer
      className={cn("flex items-center justify-end gap-4 p-4", className)}
    >
      {children}
    </footer>
  )
}
