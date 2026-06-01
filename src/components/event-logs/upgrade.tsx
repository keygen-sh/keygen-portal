import { type ReactNode } from "react"

import { Button } from "@/components/ui/button"

import { Lock } from "lucide-react"

import LockedOverlay from "@/components/locked-overlay"

const UPGRADE_URL = "https://keygen.sh/pricing"

export default function EventLogsUpgrade({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <LockedOverlay
      className={className}
      icon={<Lock className="size-4" />}
      title="Event logs is an Enterprise feature"
      description="Track and audit every change across your account. Upgrade to Keygen EE to unlock event logs."
      action={
        <Button size="sm" asChild>
          <a href={UPGRADE_URL} target="_blank" rel="noreferrer">
            Upgrade
          </a>
        </Button>
      }
    >
      {children}
    </LockedOverlay>
  )
}
