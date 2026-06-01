import { type ReactNode } from "react"

import { Lock } from "lucide-react"

import { cn } from "@/lib/utils"

interface LockedOverlayProps {
  children: ReactNode
  title: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
  className?: string
}

export default function LockedOverlay({
  children,
  title,
  description,
  icon,
  action,
  className,
}: LockedOverlayProps) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div
        aria-hidden
        className="pointer-events-none h-full blur-sm select-none"
      >
        {children}
      </div>

      <div className="absolute inset-0 flex items-center justify-center bg-background/60 p-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex size-10 items-center justify-center rounded-full bg-background-3 text-content-muted">
            {icon ?? <Lock className="size-4" />}
          </span>
          <div className="space-y-1">
            <p className="font-medium text-content-loud">{title}</p>
            {description && (
              <p className="max-w-xs text-xs text-content-muted">
                {description}
              </p>
            )}
          </div>
          {action}
        </div>
      </div>
    </div>
  )
}
