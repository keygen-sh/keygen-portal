import { Link } from "@tanstack/react-router"
import { formatDate } from "date-fns"

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import { BillingState } from "@/types/billings"

import { useGetAccount, useGetAccountBilling } from "@/queries/accounts"

import { DATE_FORMAT } from "@/lib/billing"

import * as keygen from "@/keygen"

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

export default function BillingStatusCard() {
  const { data: account } = useGetAccount()
  const { data: billing } = useGetAccountBilling(
    account?.relationships.billing?.data?.id,
  )

  const state = billing?.attributes.state
  const content = state ? STATE_CONTENT[state] : undefined
  if (!content) return null

  return (
    <Card className="w-full items-start gap-4 rounded border-none p-4">
      <CardHeader className="w-full px-0">
        <CardTitle className="text-sm">{content.title}</CardTitle>
        <CardDescription className="text-xs">
          {content.description(billing?.attributes.subscriptionPeriodEnd)}
        </CardDescription>
      </CardHeader>

      <CardFooter className="w-full px-0">
        <Button size="sm" asChild>
          <Link
            to="/$accountId/app/billing"
            params={{ accountId: keygen.config.id }}
          >
            {content.ctaLabel}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
