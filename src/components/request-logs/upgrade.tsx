import { type ReactNode } from "react"

import { Button } from "@/components/ui/button"

import { Lock } from "lucide-react"

import { PRICING_URL } from "@/lib/url"

import { useCloud } from "@/hooks/use-cloud"

import LockedOverlay from "@/components/locked-overlay"

export default function RequestLogsUpgrade({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const { isCloud } = useCloud()

  const title = isCloud
    ? "Request logs is an Ent offering"
    : "Request logs is an EE offering"
  const description = isCloud
    ? "Inspect and audit every API request across your account. Upgrade to an Ent tier to unlock request logs."
    : "Inspect and audit every API request across your account. Upgrade to Keygen EE to unlock request logs."

  return (
    <LockedOverlay
      className={className}
      icon={<Lock className="size-4" />}
      title={title}
      description={description}
      action={
        <Button size="sm" asChild>
          <a href={PRICING_URL} target="_blank" rel="noreferrer">
            View Pricing
          </a>
        </Button>
      }
    >
      {children}
    </LockedOverlay>
  )
}
