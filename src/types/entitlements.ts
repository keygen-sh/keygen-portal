import {
  APIResponse,
  Resource,
  Relationship,
  Linkage,
  Writable,
  OptionalExcept,
} from "@/types/api"
import { FormFieldError } from "@/types/forms"
import { PolicyFormValues } from "@/types/policies"

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

export interface EntitlementAttributes {
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

export type CreateEntitlementPayload = OptionalExcept<
  Writable<EntitlementAttributes>,
  "name" | "code"
>
export type UpdateEntitlementPayload = Partial<Writable<EntitlementAttributes>>

export class CreateEntitlementValidationError extends Error {
  constructor(
    public nextAttach: string[],
    public nextCreate: NonNullable<PolicyFormValues["entitlements"]>["create"],
    public fieldErrors: FormFieldError<PolicyFormValues>[],
  ) {
    super("Failed to create entitlement(s)")
    this.name = "CreateEntitlementValidationError"
  }
}
