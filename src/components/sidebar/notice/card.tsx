import { useState } from "react"
import { X } from "lucide-react"

import {
  Card,
  CardAction,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import * as Motion from "@/components/motion"

interface SidebarNoticeCardProps {
  title: React.ReactNode
  description: React.ReactNode
  onDismiss?: () => void
  dismissLabel?: string
  delay?: number
  children?: React.ReactNode
}

const LOADED_AT = Date.now()
const POP_DELAY_MS = 5000

function remainingPopDelay(): number {
  return Math.max(0, POP_DELAY_MS - (Date.now() - LOADED_AT)) / 1000
}

export default function SidebarNoticeCard({
  title,
  description,
  onDismiss,
  dismissLabel = "Dismiss",
  delay,
  children,
}: SidebarNoticeCardProps) {
  const [popDelay] = useState(() => delay ?? remainingPopDelay())

  return (
    <Motion.Rise delay={popDelay} duration={0.3} className="w-full">
      <Card className="w-full items-start gap-4 rounded border-none p-4">
        <CardHeader className="w-full px-0">
          <CardTitle className="flex items-start gap-2 text-sm">
            {title}
          </CardTitle>
          <CardDescription className="text-xs">{description}</CardDescription>
          {onDismiss && (
            <CardAction>
              <Button
                variant="ghost"
                size="icon"
                onClick={onDismiss}
                aria-label={dismissLabel}
                className="-mt-2 -mr-2 size-6 text-content-subdued"
              >
                <X className="size-3.5" />
              </Button>
            </CardAction>
          )}
        </CardHeader>

        {children && (
          <CardFooter className="w-full px-0">{children}</CardFooter>
        )}
      </Card>
    </Motion.Rise>
  )
}
