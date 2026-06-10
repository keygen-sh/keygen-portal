import { type ReactNode } from "react"

import { Lock } from "lucide-react"
import { motion } from "motion/react"

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card"

import { cn } from "@/lib/utils"

interface LockedOverlayProps {
  children?: ReactNode
  title: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
  className?: string
  sticky?: boolean
}

export default function LockedOverlay({
  children,
  title,
  description,
  icon,
  action,
  className,
  sticky = false,
}: LockedOverlayProps) {
  if (sticky) {
    return (
      <motion.div
        className={cn(
          "pointer-events-none sticky top-[calc(100dvh-min(75dvh,42rem))] z-20 -mb-[min(75dvh,42rem)] flex h-[min(75dvh,42rem)] w-full items-end justify-center bg-gradient-to-t from-background via-background/75 to-transparent px-4 pb-6",
          className,
        )}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
      >
        <LockedOverlayCard
          title={title}
          description={description}
          icon={icon}
          action={action}
          className="pointer-events-auto shadow-sm"
        />
      </motion.div>
    )
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div aria-hidden className="pointer-events-none h-full select-none">
        {children}
      </div>

      <div className="absolute inset-0 flex items-end justify-center bg-background/60 p-6">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-background via-background/20 to-transparent" />

        <LockedOverlayCard
          title={title}
          description={description}
          icon={icon}
          action={action}
        />
      </div>
    </div>
  )
}

function LockedOverlayCard({
  title,
  description,
  icon,
  action,
  className,
}: Pick<LockedOverlayProps, "title" | "description" | "icon" | "action"> & {
  className?: string
}) {
  return (
    <Card
      className={cn(
        "relative z-10 w-full max-w-sm items-start gap-4 rounded border-none p-4 text-left",
        className,
      )}
    >
      <CardHeader className="w-full px-0">
        <CardTitle className="flex items-start gap-2 text-sm">
          <span className="mt-0.5 text-content-muted">
            {icon ?? <Lock className="size-4" />}
          </span>
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-xs">{description}</CardDescription>
        )}
      </CardHeader>

      {action && <CardFooter className="w-full px-0">{action}</CardFooter>}
    </Card>
  )
}
