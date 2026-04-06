import { APIResponse, Resource, Relationship, Linkage } from "@/types/api"
import { Writable } from "@/types/utility"

export type AccountAttributes = {
  name: string
  slug: string
  apiVersion: string
  status: string
  protected: boolean
  created: string
  updated: string
}

export type AccountMeta = {
  publicKey: string
  keys: {
    ed25519: string
    rsa2048: string
    ecdsa: string
  }
}

export type AccountRelationships = {
  billing: Relationship<Linkage<"billings">>
  plan: Relationship<Linkage<"plans">>
  settings: Relationship<Linkage<"settings">[]>
}

export type Account = Resource<
  "accounts",
  AccountAttributes,
  AccountRelationships
> & {
  meta?: AccountMeta
}

export type AccountResponse = APIResponse<Account>

export const AccountAttributeDescriptions: Readonly<
  Record<keyof Writable<AccountAttributes>, string>
> = {
  name: "The name of the account.",
  slug: "A human-readable identifier for the account.",
  apiVersion:
    "The default API version for all requests to the account. Requests can override this on a per-request basis using a versioned Accept header.",
  status: "The current status of the account.",
  protected:
    "Whether or not the account is protected. When enabled, license resources that do not specify a policy will not be allowed to be created.",
} as const

export const AccountFormFieldDescriptions: Readonly<
  typeof AccountAttributeDescriptions & {
    defaultUserPermissions: string
    defaultLicensePermissions: string
  }
> = {
  ...AccountAttributeDescriptions,
  defaultUserPermissions:
    "Default permissions assigned to new users. Leave blank to use system defaults.",
  defaultLicensePermissions:
    "Default permissions assigned to new licenses. Leave blank to use system defaults.",
} as const

export const AccountKeyDescriptions: Readonly<{
  ed25519: string
  ecdsa: string
  rsa2048: string
}> = {
  ed25519:
    "Your account's Ed25519 verify key, used to verify signed license keys and artifacts.",
  ecdsa:
    "Your account's ECDSA P-256 public key, used to verify signed license keys and artifacts.",
  rsa2048:
    "Your account's RSA 2048-bit public key, used to verify signed license keys and artifacts.",
} as const

export type AccountSettingAttributes = {
  key: string
  value: string[]
  created: string
  updated: string
}

export type AccountSetting = Resource<"settings", AccountSettingAttributes>
export type AccountSettingListResponse = APIResponse<AccountSetting[]>
