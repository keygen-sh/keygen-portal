import {
  APIResponse,
  Resource,
  Relationship,
  Linkage,
  Writable,
  OptionalExcept,
} from "@/types/api"

export enum EntitlementErrorCode {
  CODE_TAKEN = "CODE_TAKEN",
}

export enum EntitlementMode {
  VIEW = "view",
  EDIT = "edit",
  CREATE = "create",
}

export enum EntitlementView {
  LIST = "list",
  DETAILS = "details",
}

export interface EntitlementAttributes {
  name: string
  code: string
  metadata: Record<string, any>
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

export type CreateEntitlementPayload = OptionalExcept<
  Writable<EntitlementAttributes>,
  "name" & "code"
>
export type UpdateEntitlementPayload = Partial<Writable<EntitlementAttributes>>
