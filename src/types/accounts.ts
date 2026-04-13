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
  slug: "We recommend that you use your account ID instead of your account slug when integrating Keygen within your product.",
  apiVersion:
    "Your account's pinned API version. Before changing this, we recommend testing against the new API version via the Keygen-Version header first.",
  status: "The current status of the account.",
  protected:
    "When an account is protected, only admins can create user, license and machine resources.",
} as const

export const AccountFormFieldDescriptions: Readonly<
  typeof AccountAttributeDescriptions & {
    defaultUserPermissions: string
    defaultLicensePermissions: string
  }
> = {
  ...AccountAttributeDescriptions,
  slug: "Be aware: changing your account slug could break existing integrations that utilize it.",
  apiVersion: "Manage your account's pinned API version.",
  protected:
    "When an account is protected, only admins can create user, license and machine resources.",
  defaultUserPermissions:
    "The default permission set for new users. Changes are not retroactive.",
  defaultLicensePermissions:
    "The default permission set for new licenses. Changes are not retroactive.",
} as const

export const AccountKeyDescriptions: Readonly<{
  ed25519: string
  ecdsa: string
  rsa2048: string
}> = {
  ed25519:
    "Your account's Ed25519 verify key, used to verify signed license files, API responses, and webhooks.",
  ecdsa:
    "Your account's ECDSA P-256 public key, used to verify signed license files, API responses, and webhooks.",
  rsa2048:
    "Your account's RSA 2048-bit public key, used to verify signed license files, API responses, and webhooks.",
} as const

export type AccountSettingAttributes = {
  key: string
  value: string[]
  created: string
  updated: string
}

export type AccountSetting = Resource<"settings", AccountSettingAttributes>
export type AccountSettingListResponse = APIResponse<AccountSetting[]>
