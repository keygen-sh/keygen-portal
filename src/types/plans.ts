import { APIResponse, Resource, Relationship, Linkage } from "@/types/api"
import { Writable } from "@/types/utility"

export type PlanAttributes = {
  name: string
  price: number | null
  interval: string
  trialDuration: number | null
  maxReqs: number | null
  maxAdmins: number | null
  maxUsers: number | null
  maxLicenses: number | null
  maxProducts: number | null
  maxPolicies: number | null
  maxStorage: number | null
  maxTransfer: number | null
  maxUpload: number | null
  private: boolean
  created: string
  updated: string
}

export type PlanRelationships = {
  account: Relationship<Linkage<"accounts">>
}

export type Plan = Resource<"plans", PlanAttributes, PlanRelationships>

export type PlanResponse = APIResponse<Plan>

export const PlanAttributeDescriptions: Readonly<
  Record<keyof Writable<PlanAttributes>, string>
> = {
  name: "The name of the subscription plan.",
  price:
    "The recurring price of the subscription, billed at the plan's interval.",
  interval: "The billing cadence for the subscription, e.g. monthly or yearly.",
  trialDuration: "The length of the free trial for the plan, in seconds.",
  maxReqs:
    "The maximum number of API requests the account can make per day on this plan.",
  maxAdmins:
    "The maximum number of admin users the account can have on this plan.",
  maxUsers:
    "The maximum number of license users the account can have on this plan.",
  maxLicenses:
    "The maximum number of licenses the account can have on this plan.",
  maxProducts:
    "The maximum number of products the account can have on this plan.",
  maxPolicies:
    "The maximum number of policies the account can have on this plan.",
  maxStorage: "The maximum amount of storage the account can use on this plan.",
  maxTransfer:
    "The maximum amount of data transfer the account can use on this plan.",
  maxUpload: "The maximum size per upload on this plan.",
  private: "Whether the plan is private and hidden from public listings.",
} as const
