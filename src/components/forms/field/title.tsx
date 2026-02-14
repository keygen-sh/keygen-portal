import { cn } from "@/lib/utils"

interface FormsFieldTitleProps {
  children: React.ReactNode
  className?: string
}

export default function FormsFieldTitle({
  children,
  className,
}: FormsFieldTitleProps) {
  return <div className={cn("m-4 md:mx-6 md:my-8", className)}>{children}</div>
}
