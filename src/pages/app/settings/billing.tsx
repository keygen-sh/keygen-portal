import { useState } from "react"
import { formatDate } from "date-fns"

import { ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"

import {
  useGetAccount,
  useGetAccountPlan,
  useGetAccountBilling,
  useManageSubscription,
  useCancelSubscription,
} from "@/queries/accounts"

import { toast } from "@/lib/toast"

import { PlanAttributeDescriptions } from "@/types/plans"
import {
  BillingState,
  BillingStateLabels,
  BillingStateDescriptions,
  BillingAttributeDescriptions,
} from "@/types/billings"

import * as Attribute from "@/components/attribute"
import PageHeader from "@/components/page-header"
import ConfirmationModal from "@/components/confirmation-modal"

const DATE_FORMAT = "MM/dd/yyyy"

function formatRange(start?: string | null, end?: string | null) {
  if (!start || !end) return null

  return `${formatDate(new Date(start), DATE_FORMAT)} - ${formatDate(
    new Date(end),
    DATE_FORMAT,
  )}`
}

function formatPrice(price: number | null, interval: string | null) {
  if (price == null) return "Custom"
  if (price === 0) return "Free"

  const amount = (price / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  })

  return interval ? `${amount} / ${interval}` : amount
}

export default function BillingPage() {
  const [confirmingCancel, setConfirmingCancel] = useState(false)

  const { data: account, isLoading: accountLoading } = useGetAccount()
  const { data: plan, isLoading: planLoading } = useGetAccountPlan(
    account?.relationships.plan?.data?.id,
  )
  const { data: billing, isLoading: billingLoading } = useGetAccountBilling(
    account?.relationships.billing?.data?.id,
  )

  const manageSubscription = useManageSubscription()
  const cancelSubscription = useCancelSubscription()

  const isLoading = accountLoading || planLoading || billingLoading

  const state = billing?.attributes.state
  const periodEnd = billing?.attributes.subscriptionPeriodEnd
  const billingPeriod = formatRange(
    billing?.attributes.subscriptionPeriodStart,
    billing?.attributes.subscriptionPeriodEnd,
  )
  const periodEndLabel = periodEnd
    ? formatDate(new Date(periodEnd), DATE_FORMAT)
    : "the end of your current period"

  const isCanceling =
    state === BillingState.Canceling || state === BillingState.Canceled

  const handleOpenPortal = async () => {
    try {
      const url = await manageSubscription.mutateAsync()

      window.location.href = url
    } catch {
      toast({
        message: "Unable to open billing portal.",
        variant: "error",
      })
    }
  }

  const handleCancelSubscription = async () => {
    try {
      await cancelSubscription.mutateAsync()

      toast({
        message: "Subscription cancellation scheduled.",
        variant: "success",
      })
      setConfirmingCancel(false)
    } catch {
      toast({
        message: "Unable to cancel subscription.",
        variant: "error",
      })
    }
  }

  return (
    <section className="flex h-screen flex-col">
      <PageHeader title="Billing" />

      <ScrollArea className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-col px-4 py-4 md:px-10 md:py-8">
          <div className="grid w-full max-w-5xl grid-cols-1 gap-x-16 gap-y-8 md:grid-cols-[1fr_2fr]">
            <div className="flex flex-col space-y-2">
              <h2 className="font-owners-wide text-lg text-content-loud">
                Current Plan
              </h2>
              <p className="font-owners-text text-sm text-content-muted">
                Overview of your current subscription and plan limits.
              </p>
            </div>
            <div className="overflow-hidden rounded bg-background-1">
              <div className="flex flex-col gap-4 p-4">
                {isLoading ? (
                  <div className="flex flex-col gap-3">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                  </div>
                ) : (
                  <>
                    <Attribute.Field
                      label="Name"
                      variant="none"
                      value={
                        <Attribute.Value
                          type="raw"
                          value={plan?.attributes.name ?? null}
                          emptyLabel="Not set"
                          tooltip={PlanAttributeDescriptions.name}
                        />
                      }
                    />
                    <Attribute.Field
                      label="Status"
                      variant="none"
                      value={
                        <Attribute.Value
                          type="raw"
                          value={state ? BillingStateLabels[state] : null}
                          emptyLabel="Not set"
                          tooltip={
                            state
                              ? BillingStateDescriptions[state]
                              : BillingAttributeDescriptions.state
                          }
                        />
                      }
                    />
                    <Attribute.Field
                      label="Billing Period"
                      variant="none"
                      value={
                        <Attribute.Value
                          type="raw"
                          value={billingPeriod}
                          emptyLabel="Not set"
                          tooltip={
                            BillingAttributeDescriptions.subscriptionPeriodEnd
                          }
                        />
                      }
                    />
                    <Attribute.Field
                      label="Price"
                      variant="none"
                      value={
                        <Attribute.Value
                          type="raw"
                          value={formatPrice(
                            plan?.attributes.price ?? null,
                            plan?.attributes.interval ?? null,
                          )}
                          tooltip={PlanAttributeDescriptions.price}
                        />
                      }
                    />
                    <Attribute.Field
                      label="API requests per day"
                      variant="none"
                      value={
                        <Attribute.Value
                          type="string"
                          value={
                            plan?.attributes.maxReqs != null
                              ? String(plan.attributes.maxReqs)
                              : null
                          }
                          emptyLabel="Unlimited"
                          tooltip={PlanAttributeDescriptions.maxReqs}
                        />
                      }
                    />
                    <Attribute.Field
                      label="License user limit"
                      variant="none"
                      value={
                        <Attribute.Value
                          type="string"
                          value={
                            plan?.attributes.maxUsers != null
                              ? String(plan.attributes.maxUsers)
                              : null
                          }
                          emptyLabel="Unlimited"
                          tooltip={PlanAttributeDescriptions.maxUsers}
                        />
                      }
                    />
                    <Attribute.Field
                      label="Product limit"
                      variant="none"
                      value={
                        <Attribute.Value
                          type="string"
                          value={
                            plan?.attributes.maxProducts != null
                              ? String(plan.attributes.maxProducts)
                              : null
                          }
                          emptyLabel="Unlimited"
                          tooltip={PlanAttributeDescriptions.maxProducts}
                        />
                      }
                    />
                    <Attribute.Field
                      label="Policy limit"
                      variant="none"
                      value={
                        <Attribute.Value
                          type="string"
                          value={
                            plan?.attributes.maxPolicies != null
                              ? String(plan.attributes.maxPolicies)
                              : null
                          }
                          emptyLabel="Unlimited"
                          tooltip={PlanAttributeDescriptions.maxPolicies}
                        />
                      }
                    />
                    <Attribute.Field
                      label="Admin limit"
                      variant="none"
                      value={
                        <Attribute.Value
                          type="string"
                          value={
                            plan?.attributes.maxAdmins != null
                              ? String(plan.attributes.maxAdmins)
                              : null
                          }
                          emptyLabel="Unlimited"
                          tooltip={PlanAttributeDescriptions.maxAdmins}
                        />
                      }
                    />
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <h2 className="font-owners-wide text-lg text-content-loud">
                Billing
              </h2>
              <p className="font-owners-text text-sm text-content-muted">
                Change plans, add or edit payment methods, edit your address,
                add your tax ID, and view and download past receipts.
              </p>
            </div>
            <div className="flex h-fit justify-end overflow-hidden rounded bg-background-1">
              <div className="flex flex-col gap-4 p-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    onClick={handleOpenPortal}
                    disabled={manageSubscription.isPending}
                  >
                    <ExternalLink className="size-4" />
                    Open Billing Portal
                  </Button>
                  {isCanceling ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span tabIndex={0} className="rounded-md">
                          <Button variant="destructive" size="sm" disabled>
                            Cancel Subscription
                          </Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-64 bg-background-4 text-pretty text-content-muted">
                        {state
                          ? BillingStateDescriptions[state]
                          : BillingAttributeDescriptions.state}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setConfirmingCancel(true)}
                      disabled={cancelSubscription.isPending}
                    >
                      Cancel Subscription
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>

      <ConfirmationModal
        open={confirmingCancel}
        onClose={() => setConfirmingCancel(false)}
        onConfirm={handleCancelSubscription}
        title="Cancel subscription"
        description={`You are canceling your account's subscription. All API access will be disabled after your current subscription period ends on ${periodEndLabel}.`}
        label="Cancel Subscription"
        variant="destructive"
        confirmText="cancel"
        disabled={cancelSubscription.isPending}
      />
    </section>
  )
}
