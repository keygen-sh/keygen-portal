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

export const MockEntitlements: Entitlement[] = [
  {
    id: "db1ff21b-f42f-4623-952b-ca7f2600bded",
    type: "entitlements",
    attributes: {
      name: "Example Feature 1",
      code: "EXAMPLE_FEATURE_1",
      metadata: {},
      created: "2017-01-02T20:26:53.464Z",
      updated: "2017-01-02T20:26:53.464Z",
    },
    relationships: {
      account: {
        links: {
          related: "/v1/accounts/<account>",
        },
        data: {
          type: "accounts",
          id: "<account>",
        },
      },
    },
    links: {
      self: "/v1/accounts/<account>/entitlements/db1ff21b-f42f-4623-952b-ca7f2600bded",
    },
  },
  {
    id: "kb23jkb-f42f-4623-952b-ca7f2600bded",
    type: "entitlements",
    attributes: {
      name: "Example Feature 2",
      code: "EXAMPLE_FEATURE_2",
      metadata: {},
      created: "2017-01-02T20:26:53.464Z",
      updated: "2017-01-02T20:26:53.464Z",
    },
    relationships: {
      account: {
        links: {
          related: "/v1/accounts/<account>",
        },
        data: {
          type: "accounts",
          id: "<account>",
        },
      },
    },
    links: {
      self: "/v1/accounts/<account>/entitlements/kb23jkb-f42f-4623-952b-ca7f2600bded",
    },
  },
]
