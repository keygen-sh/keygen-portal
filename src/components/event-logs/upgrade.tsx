import { type ReactNode } from "react"

import { Button } from "@/components/ui/button"

import { Lock } from "lucide-react"

import LockedOverlay from "@/components/locked-overlay"
import { useCloud } from "@/hooks/use-cloud"

const UPGRADE_URL = "https://keygen.sh/pricing"

export default function EventLogsUpgrade({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const { isCloud } = useCloud()

  const title = isCloud
    ? "Event logs is an Ent offering"
    : "Event logs is an EE offering"
  const description = isCloud
    ? "Track and audit every change across your account. Upgrade to an Ent tier to unlock event logs."
    : "Track and audit every change across your account. Upgrade to Keygen EE to unlock event logs."

  return (
    <LockedOverlay
      className={className}
      icon={<Lock className="size-4" />}
      title={title}
      description={description}
      action={
        <Button size="sm" asChild>
          <a href={UPGRADE_URL} target="_blank" rel="noreferrer">
            View Pricing
          </a>
        </Button>
      }
    >
      {children}
    </LockedOverlay>
  )
}
