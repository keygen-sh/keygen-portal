import { Link } from "@tanstack/react-router"
import { formatDate } from "date-fns"

import { Button } from "@/components/ui/button"

import { BillingState } from "@/types/billings"

import { useGetAccount, useGetAccountBilling } from "@/queries/accounts"

import { DATE_FORMAT } from "@/lib/timestamps"

import * as keygen from "@/keygen"

import SidebarNoticeCard from "./card"

type StateContent = {
  title: string
  description: (periodEnd: string | null | undefined) => string
  ctaLabel: string
}

const STATE_CONTENT: Partial<Record<BillingState, StateContent>> = {
  [BillingState.Trialing]: {
    title: "Your free trial ends soon",
    description: (end) =>
      end
        ? `Your trial ends on ${formatDate(new Date(end), DATE_FORMAT)}. Upgrade to keep full access.`
        : "Upgrade today to enjoy the full set of features from Keygen.",
    ctaLabel: "Upgrade",
  },
  [BillingState.Paused]: {
    title: "Your subscription is paused",
    description: () => "Resume your subscription to restore API access.",
    ctaLabel: "Resume",
  },
  [BillingState.Canceling]: {
    title: "Your subscription is ending",
    description: (end) =>
      end
        ? `Access ends ${formatDate(new Date(end), DATE_FORMAT)}. Reactivate to keep your subscription.`
        : "Access ends soon. Reactivate to keep your subscription.",
    ctaLabel: "Reactivate",
  },
  [BillingState.Canceled]: {
    title: "Your subscription has ended",
    description: () => "Reactivate to restore API access.",
    ctaLabel: "Reactivate",
  },
}

export default function SidebarNoticeBilling() {
  const { data: account } = useGetAccount()
  const { data: billing } = useGetAccountBilling(
    account?.relationships.billing?.data?.id,
  )

  const state = billing?.attributes.state
  const content = state ? STATE_CONTENT[state] : undefined
  if (!content) return null

  return (
    <SidebarNoticeCard
      title={content.title}
      description={content.description(
        billing?.attributes.subscriptionPeriodEnd,
      )}
    >
      <Button size="sm" asChild>
        <Link
          to="/$accountId/app/billing"
          params={{ accountId: keygen.config.id }}
        >
          {content.ctaLabel}
        </Link>
      </Button>
    </SidebarNoticeCard>
  )
}
