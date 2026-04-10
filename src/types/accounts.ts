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
  protected: "The default permission set for new users.",
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
    "Your account's Ed25519 verify key, used to verify signed license keys and artifacts.",
  ecdsa:
    "Your account's ECDSA P-256 public key, used to verify signed license keys and artifacts.",
  rsa2048:
    "Your account's RSA 2048-bit public key, used to verify signed license keys and artifacts.",
} as const

export const UserPermissions = [
  "account.read",
  "arch.read",
  "artifact.read",
  "channel.read",
  "component.create",
  "component.delete",
  "component.read",
  "component.update",
  "constraint.read",
  "engine.read",
  "entitlement.read",
  "group.owners.read",
  "group.read",
  "group.users.read",
  "license.check-in",
  "license.check-out",
  "license.create",
  "license.delete",
  "license.policy.update",
  "license.read",
  "license.renew",
  "license.revoke",
  "license.usage.increment",
  "license.users.attach",
  "license.users.detach",
  "license.validate",
  "machine.check-out",
  "machine.create",
  "machine.delete",
  "machine.heartbeat.ping",
  "machine.proofs.generate",
  "machine.read",
  "machine.update",
  "package.read",
  "platform.read",
  "policy.read",
  "process.create",
  "process.delete",
  "process.heartbeat.ping",
  "process.read",
  "process.update",
  "product.read",
  "release.download",
  "release.read",
  "release.upgrade",
  "token.generate",
  "token.read",
  "token.regenerate",
  "token.revoke",
  "user.password.update",
  "user.read",
  "user.second-factors.create",
  "user.second-factors.delete",
  "user.second-factors.read",
  "user.second-factors.update",
  "user.update",
]

export const LicensePermissions = [
  "account.read",
  "arch.read",
  "artifact.read",
  "channel.read",
  "component.read",
  "constraint.read",
  "engine.read",
  "entitlement.read",
  "group.owners.read",
  "group.read",
  "license.check-in",
  "license.check-out",
  "license.read",
  "license.usage.increment",
  "license.validate",
  "machine.check-out",
  "machine.create",
  "machine.delete",
  "machine.heartbeat.ping",
  "machine.proofs.generate",
  "machine.read",
  "machine.update",
  "package.read",
  "platform.read",
  "policy.read",
  "process.create",
  "process.delete",
  "process.heartbeat.ping",
  "process.read",
  "process.update",
  "product.read",
  "release.download",
  "release.read",
  "release.upgrade",
  "token.read",
  "token.regenerate",
  "token.revoke",
  "user.read",
]

export type AccountSettingAttributes = {
  key: string
  value: string[]
  created: string
  updated: string
}

export type AccountSetting = Resource<"settings", AccountSettingAttributes>
export type AccountSettingListResponse = APIResponse<AccountSetting[]>
