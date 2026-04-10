import { APIResponse, Resource, Relationship, Linkage } from "@/types/api"

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
