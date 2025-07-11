import { PropsWithChildren } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useMobile } from "@/hooks/use-mobile"

import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title?: string
  className?: string
}

export default function PageHeader({
  title,
  className,
  children,
}: PropsWithChildren<PageHeaderProps>) {
  const isMobile = useMobile()

  return (
    <header
      className={cn(
        "flex items-center gap-2 border-b border-accent p-2 md:p-4",
        className,
      )}
    >
      {isMobile && <SidebarTrigger />}

      {title && (
        <h1 className="flex-1 font-semibold text-content-muted">{title}</h1>
      )}

      {children}
    </header>
  )
}
