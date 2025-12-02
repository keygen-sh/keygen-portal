import { APIResponse, Resource, Relationship, Linkage } from "@/types/api"

export enum EntitlementErrorCode {
  CodeTaken = "CODE_TAKEN",
}

export enum EntitlementMode {
  View = "view",
  Edit = "edit",
  Create = "create",
}

export enum EntitlementView {
  List = "list",
  Details = "details",
}

export type EntitlementAttributes = {
  name: string
  code: string
  metadata: Record<string, unknown>
  created: string
  updated: string
}

export type EntitlementRelationships = {
  account: Relationship<Linkage<"accounts">>
}

export type Entitlement = Resource<
  "entitlements",
  EntitlementAttributes,
  EntitlementRelationships
>

export type EntitlementResponse = APIResponse<Entitlement>
export type EntitlementListResponse = APIResponse<Entitlement[]>
