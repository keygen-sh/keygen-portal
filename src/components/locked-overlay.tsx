import { type ReactNode } from "react"

import { Lock } from "lucide-react"

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card"

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
      <div aria-hidden className="pointer-events-none h-full select-none">
        {children}
      </div>

      <div className="absolute inset-0 flex items-end justify-center bg-background/60 p-6">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-background via-background/20 to-transparent" />

        <Card className="relative z-10 w-full max-w-sm items-start gap-4 rounded border-none p-4 text-left">
          <CardHeader className="w-full px-0">
            <CardTitle className="flex items-start gap-2 text-sm">
              <span className="mt-0.5 text-content-muted">
                {icon ?? <Lock className="size-4" />}
              </span>
              {title}
            </CardTitle>
            {description && (
              <CardDescription className="text-xs">
                {description}
              </CardDescription>
            )}
          </CardHeader>

          {action && <CardFooter className="w-full px-0">{action}</CardFooter>}
        </Card>
      </div>
    </div>
  )
}
