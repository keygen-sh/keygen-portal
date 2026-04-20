import { APIResponse, Resource, Relationship, Linkage } from "@/types/api"
import { Writable } from "@/types/utility"

export enum BillingState {
  Pending = "pending",
  Trialing = "trialing",
  Subscribed = "subscribed",
  Paused = "paused",
  Canceling = "canceling",
  Canceled = "canceled",
}

export type BillingAttributes = {
  subscriptionStatus: string | null
  subscriptionPeriodStart: string | null
  subscriptionPeriodEnd: string | null
  cardExpiry: string | null
  cardBrand: string | null
  cardLast4: string | null
  state: BillingState
  created: string
  updated: string
}

export type BillingRelationships = {
  account: Relationship<Linkage<"accounts">>
  plan: Relationship<Linkage<"plans">>
}

export type Billing = Resource<
  "billings",
  BillingAttributes,
  BillingRelationships
>

export type BillingResponse = APIResponse<Billing>

export const BillingAttributeDescriptions: Readonly<
  Record<keyof Writable<BillingAttributes>, string>
> = {
  state: "The current state of the subscription.",
  subscriptionStatus:
    "The upstream subscription status reported by the billing provider.",
  subscriptionPeriodStart:
    "The start of the current subscription billing period.",
  subscriptionPeriodEnd: "The end of the current subscription billing period.",
  cardExpiry: "The expiration date of the card on file.",
  cardBrand: "The brand of the card on file.",
  cardLast4: "The last four digits of the card on file.",
} as const

export const BillingStateLabels: Readonly<Record<BillingState, string>> = {
  [BillingState.Pending]: "Pending",
  [BillingState.Trialing]: "Trialing",
  [BillingState.Subscribed]: "Subscribed",
  [BillingState.Paused]: "Paused",
  [BillingState.Canceling]: "Canceling",
  [BillingState.Canceled]: "Canceled",
} as const

export const BillingStateDescriptions: Readonly<Record<BillingState, string>> =
  {
    [BillingState.Pending]: "Subscription is pending and awaiting activation.",
    [BillingState.Trialing]: "Subscription is in a free trial.",
    [BillingState.Subscribed]: "Subscription is currently active.",
    [BillingState.Paused]:
      "Subscription is paused and will not renew until resumed.",
    [BillingState.Canceling]:
      "Subscription has been cancelled and will end at the close of the current billing period.",
    [BillingState.Canceled]: "No subscription is currently active.",
  } as const
