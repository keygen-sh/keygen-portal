import { APIResponse, Resource, Relationship, Linkage } from "@/types/api"
import { Writable } from "@/types/utility"

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

export const EntitlementAttributeDescriptions: Readonly<
  Record<keyof Writable<EntitlementAttributes>, string>
> = {
  name: "Entitlement name.",
  code: "This can be used to lookup the entitlement by a human-readable identifier.",
  metadata:
    "Store arbitrary key/value data on the entitlement for book keeping purposes, supplemental entitlement data, etc.",
} as const

export const EntitlementFormFieldDescriptions: typeof EntitlementAttributeDescriptions =
  {
    ...EntitlementAttributeDescriptions,
  }

export const EntitlementCreateFormFieldDescriptions: typeof EntitlementFormFieldDescriptions =
  {
    ...EntitlementFormFieldDescriptions,
  }

export const EntitlementEditFormFieldDescriptions: typeof EntitlementFormFieldDescriptions =
  {
    ...EntitlementFormFieldDescriptions,
  }
