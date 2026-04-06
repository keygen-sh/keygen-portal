import { APIResponse, Resource, Relationship, Linkage } from "@/types/api"

export type SecondFactorAttributes = {
  uri: string | null
  secret: string | null
  enabled: boolean
  created: string
  updated: string
}

export type SecondFactorRelationships = {
  account: Relationship<Linkage<"accounts">>
  user: Relationship<Linkage<"users">>
}

export type SecondFactor = Resource<
  "second-factors",
  SecondFactorAttributes,
  SecondFactorRelationships
>

export type SecondFactorResponse = APIResponse<SecondFactor>
export type SecondFactorListResponse = APIResponse<SecondFactor[]>
