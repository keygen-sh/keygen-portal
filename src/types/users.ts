import { APIResponse, Resource, Relationship, Linkage } from "@/types/api"
import { Writable } from "@/types/utility"

export enum UserErrorCode {
  EmailTaken = "EMAIL_TAKEN",
}

export enum UserMode {
  View = "view",
  Edit = "edit",
  Create = "create",
}

export enum UserView {
  List = "list",
  Details = "details",
}

export enum UserStatus {
  Active = "ACTIVE",
  Inactive = "INACTIVE",
  Banned = "BANNED",
}

export enum UserRole {
  User = "user",
  SupportAgent = "support-agent",
  SalesAgent = "sales-agent",
  Developer = "developer",
  ReadOnly = "read-only",
  Admin = "admin",
}

export type UserAttributes = {
  email: string
  firstName: string | null
  lastName: string | null
  fullName: string | null
  status: UserStatus
  role: UserRole
  permissions: string[] | null
  metadata: Record<string, unknown>
  created: string
  updated: string
}

export interface UserInput {
  email?: string
  firstName?: string | null
  lastName?: string | null
  role?: UserRole
  permissions?: string[] | null
  metadata?: Record<string, unknown>
}

export type UserRelationships = {
  account: Relationship<Linkage<"accounts">>
  environment: Relationship<Linkage<"environments"> | null>
  group: Relationship<Linkage<"groups"> | null>
  products: Relationship<Linkage<"products">[]>
  licenses: Relationship<Linkage<"licenses">[]>
  machines: Relationship<Linkage<"machines">[]>
  tokens: Relationship<Linkage<"tokens">[]>
  secondFactors: Relationship<Linkage<"second-factors">[]>
}

export type User = Resource<"users", UserAttributes, UserRelationships>

export type UserResponse = APIResponse<User>
export type UserListResponse = APIResponse<User[]>

export const UserAttributeDescriptions: Readonly<
  Record<keyof Writable<UserAttributes>, string>
> = {
  fullName: "The full name of the user.",
  firstName: "The first name of the user.",
  lastName: "The last name of the user.",
  email: "The unique email of the user.",
  status: "The status of the user.",
  role: "The role of the user.",
  permissions: "The permissions for the user.",
  metadata:
    "Store arbitrary key/value data on the user for book keeping purposes, entitlements, etc.",
} as const

export const UserFormFieldDescriptions: typeof UserAttributeDescriptions & {
  group: string
  password: string
} = {
  ...UserAttributeDescriptions,
  password:
    "The password for the user. Must be at least 8 characters. May be set to null for a passwordless user.",
  group: "The group the user belongs to.",
}

export const UserPasswordFormFieldDescriptions = {
  oldPassword: "Your current account password.",
  newPassword: "Your new password. Must be at least 8 characters.",
  confirmPassword: "Re-enter your new password to confirm.",
} as const

export const UserCreateFormFieldDescriptions: typeof UserFormFieldDescriptions =
  {
    ...UserFormFieldDescriptions,
  }

export const UserEditFormFieldDescriptions: typeof UserFormFieldDescriptions = {
  ...UserFormFieldDescriptions,
  password:
    "Manually change the user's password. Leave the password blank if you do not wish to change it.",
}

export const UserStatusDescriptions: Readonly<Record<UserStatus, string>> = {
  [UserStatus.Active]:
    "User was created within the last 90 days, or has a license that has been created, validated, checked-out, or checked-in within the last 90 days.",
  [UserStatus.Inactive]:
    "User was not created in the past 90 days, or has a license that has not been created, validated, checked-out, or checked-in in the past 90 days.",
  [UserStatus.Banned]: "User is banned and cannot authenticate with the API.",
} as const

export const UserStatusLabels: Readonly<Record<UserStatus, string>> = {
  [UserStatus.Active]: "Active",
  [UserStatus.Inactive]: "Inactive",
  [UserStatus.Banned]: "Banned",
} as const

export const UserStatusVariants: Readonly<
  Record<
    UserStatus,
    "default" | "secondary" | "destructive" | "outline" | "disabled"
  >
> = {
  [UserStatus.Active]: "secondary",
  [UserStatus.Inactive]: "disabled",
  [UserStatus.Banned]: "destructive",
} as const

export const UserRoleLabels: Readonly<Record<UserRole, string>> = {
  [UserRole.User]: "User",
  [UserRole.SupportAgent]: "Support Agent",
  [UserRole.SalesAgent]: "Sales Agent",
  [UserRole.Developer]: "Developer",
  [UserRole.ReadOnly]: "Read-only",
  [UserRole.Admin]: "Admin",
} as const

export const UserRoleDescriptions: Readonly<Record<UserRole, string>> = {
  [UserRole.User]:
    "A normal user of one or more of your products. Depending on account settings, they can have permission to manage their own resources, e.g. licenses and machines. They cannot manage other users' resources.",
  [UserRole.SupportAgent]:
    "An internal administrative user of your Keygen account, with a limited subset of permissions. Support Agents can read most resource data, but cannot create, update or delete resources.",
  [UserRole.SalesAgent]:
    "An internal administrative user of your Keygen account, with a limited subset of permissions. Sales Agents can read most resource data, but can only create, update and delete specific resources.",
  [UserRole.Developer]:
    "An internal administrative user of your Keygen account, with permission to manage all resources, but they cannot manage account billing.",
  [UserRole.ReadOnly]:
    "An internal administrative user of your Keygen account, with permission to read all resources, except for account billing.",
  [UserRole.Admin]:
    "An internal administrative user of your Keygen account, with permission to manage the entire account.",
} as const

export const ExternalRoles: UserRole[] = [UserRole.User]

export const InternalRoles: UserRole[] = [
  UserRole.Admin,
  UserRole.Developer,
  UserRole.ReadOnly,
  UserRole.SalesAgent,
  UserRole.SupportAgent,
]

export const AllRoles: UserRole[] = [...ExternalRoles, ...InternalRoles]

export type UserFilters = {
  status?: string
  assigned?: boolean
  product?: string
  group?: string
  roles?: string[]
  metadata?: Record<string, string>
}

export const Permissions = [
  "account.analytics.read",
  "account.billing.read",
  "account.billing.update",
  "account.plan.read",
  "account.plan.update",
  "account.read",
  "account.subscription.read",
  "account.subscription.update",
  "account.update",
  "admin.create",
  "admin.delete",
  "admin.invite",
  "admin.read",
  "admin.update",
  "arch.read",
  "artifact.create",
  "artifact.delete",
  "artifact.read",
  "artifact.update",
  "component.create",
  "component.delete",
  "component.read",
  "component.update",
  "channel.read",
  "constraint.read",
  "engine.read",
  "entitlement.create",
  "entitlement.delete",
  "entitlement.read",
  "entitlement.update",
  "environment.create",
  "environment.delete",
  "environment.read",
  "environment.tokens.generate",
  "environment.update",
  "event-log.read",
  "group.create",
  "group.delete",
  "group.licenses.read",
  "group.machines.read",
  "group.owners.attach",
  "group.owners.detach",
  "group.owners.read",
  "group.read",
  "group.update",
  "group.users.read",
  "key.create",
  "key.delete",
  "key.read",
  "key.update",
  "license.check-in",
  "license.check-out",
  "license.create",
  "license.delete",
  "license.entitlements.attach",
  "license.entitlements.detach",
  "license.group.update",
  "license.owner.update",
  "license.policy.update",
  "license.read",
  "license.reinstate",
  "license.renew",
  "license.revoke",
  "license.suspend",
  "license.tokens.generate",
  "license.update",
  "license.usage.decrement",
  "license.usage.increment",
  "license.usage.reset",
  "license.user.update",
  "license.users.attach",
  "license.users.detach",
  "license.validate",
  "machine.check-out",
  "machine.create",
  "machine.delete",
  "machine.group.update",
  "machine.heartbeat.ping",
  "machine.heartbeat.reset",
  "machine.owner.update",
  "machine.proofs.generate",
  "machine.read",
  "machine.update",
  "package.create",
  "package.delete",
  "package.read",
  "package.update",
  "platform.read",
  "policy.create",
  "policy.delete",
  "policy.entitlements.attach",
  "policy.entitlements.detach",
  "policy.pool.pop",
  "policy.read",
  "policy.update",
  "process.create",
  "process.delete",
  "process.heartbeat.ping",
  "process.read",
  "process.update",
  "product.create",
  "product.delete",
  "product.read",
  "product.tokens.generate",
  "product.update",
  "release.constraints.attach",
  "release.constraints.detach",
  "release.create",
  "release.delete",
  "release.download",
  "release.package.update",
  "release.publish",
  "release.read",
  "release.update",
  "release.upgrade",
  "release.upload",
  "release.yank",
  "request-log.read",
  "token.generate",
  "token.read",
  "token.regenerate",
  "token.revoke",
  "user.ban",
  "user.create",
  "user.delete",
  "user.group.update",
  "user.invite",
  "user.password.reset",
  "user.password.update",
  "user.read",
  "user.second-factors.create",
  "user.second-factors.delete",
  "user.second-factors.read",
  "user.second-factors.update",
  "user.tokens.generate",
  "user.unban",
  "user.update",
  "webhook-endpoint.create",
  "webhook-endpoint.delete",
  "webhook-endpoint.read",
  "webhook-endpoint.update",
  "webhook-event.delete",
  "webhook-event.read",
  "webhook-event.retry",
] as const

export type Permission = (typeof Permissions)[number]

export const WildcardPermission = "*"

export const PortalRequiredPermissions: readonly Permission[] = [
  "account.read",
  "user.read",
  "user.password.update",
  "user.password.reset",
  "user.second-factors.create",
  "user.second-factors.delete",
  "user.second-factors.read",
  "user.second-factors.update",
  "token.generate",
  "token.read",
  "token.revoke",
]

export const RequiredPermissionsByRole: Readonly<
  Record<UserRole, readonly Permission[]>
> = {
  [UserRole.Admin]: [...PortalRequiredPermissions, "admin.read"],
  [UserRole.Developer]: PortalRequiredPermissions,
  [UserRole.ReadOnly]: PortalRequiredPermissions,
  [UserRole.SalesAgent]: PortalRequiredPermissions,
  [UserRole.SupportAgent]: PortalRequiredPermissions,
  [UserRole.User]: [],
}

const ReadOnlyPermissions: readonly Permission[] = [
  "account.analytics.read",
  "account.billing.read",
  "account.plan.read",
  "account.read",
  "account.subscription.read",
  "admin.read",
  "arch.read",
  "artifact.read",
  "channel.read",
  "component.read",
  "constraint.read",
  "engine.read",
  "entitlement.read",
  "environment.read",
  "event-log.read",
  "group.licenses.read",
  "group.machines.read",
  "group.owners.read",
  "group.read",
  "group.users.read",
  "key.read",
  "license.read",
  "license.validate",
  "machine.read",
  "package.read",
  "platform.read",
  "policy.read",
  "process.read",
  "product.read",
  "release.download",
  "release.read",
  "release.upgrade",
  "request-log.read",
  "token.generate",
  "token.read",
  "user.password.reset",
  "user.password.update",
  "user.read",
  "user.second-factors.read",
  "webhook-endpoint.read",
  "webhook-event.read",
]

export const UserPermissions: readonly Permission[] = [
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
  "group.licenses.read",
  "group.machines.read",
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
  "user.password.reset",
  "user.password.update",
  "user.read",
  "user.second-factors.create",
  "user.second-factors.delete",
  "user.second-factors.read",
  "user.second-factors.update",
  "user.update",
]

// https://github.com/keygen-sh/keygen-api/blob/af351aed20101032348a3c146b6fdca7ece3b814/app/models/user.rb#L106-L115
const LegacyDefaultUserExclusions: ReadonlySet<Permission> = new Set([
  "account.read",
  "license.users.attach",
  "license.users.detach",
  "policy.read",
  "product.read",
])

export const AdminDefaultPermissions: readonly Permission[] = [...Permissions]

// can grow or prune these as needed
export const DeveloperDefaultPermissions: readonly Permission[] = [
  ...AdminDefaultPermissions,
]
export const SupportAgentDefaultPermissions: readonly Permission[] = [
  ...AdminDefaultPermissions,
]
export const SalesAgentDefaultPermissions: readonly Permission[] = [
  ...AdminDefaultPermissions,
]
export const ReadOnlyDefaultPermissions: readonly Permission[] = [
  ...ReadOnlyPermissions,
]
export const UserDefaultPermissions: readonly Permission[] =
  UserPermissions.filter((p) => !LegacyDefaultUserExclusions.has(p))

export const DefaultPermissionsByRole: Readonly<
  Record<UserRole, readonly Permission[]>
> = {
  [UserRole.Admin]: AdminDefaultPermissions,
  [UserRole.Developer]: DeveloperDefaultPermissions,
  [UserRole.ReadOnly]: ReadOnlyDefaultPermissions,
  [UserRole.SalesAgent]: SalesAgentDefaultPermissions,
  [UserRole.SupportAgent]: SupportAgentDefaultPermissions,
  [UserRole.User]: UserDefaultPermissions,
}

export const AllowedPermissionsByRole: Readonly<
  Record<UserRole, readonly Permission[]>
> = {
  [UserRole.Admin]: Permissions,
  [UserRole.Developer]: Permissions,
  [UserRole.ReadOnly]: ReadOnlyPermissions,
  [UserRole.SalesAgent]: Permissions,
  [UserRole.SupportAgent]: Permissions,
  [UserRole.User]: UserPermissions,
}

export const PermissionGroupLabels: Readonly<Record<string, string>> = {
  account: "Account",
  admin: "Admin",
  arch: "Architectures",
  artifact: "Artifacts",
  channel: "Channels",
  component: "Components",
  constraint: "Constraints",
  engine: "Engines",
  entitlement: "Entitlements",
  environment: "Environments",
  "event-log": "Event logs",
  group: "Groups",
  key: "Keys",
  license: "Licenses",
  machine: "Machines",
  package: "Packages",
  platform: "Platforms",
  policy: "Policies",
  process: "Processes",
  product: "Products",
  release: "Releases",
  "request-log": "Request logs",
  token: "Tokens",
  user: "Users",
  "webhook-endpoint": "Webhook endpoints",
  "webhook-event": "Webhook events",
}

export const PermissionDescriptions: Readonly<Record<Permission, string>> = {
  "account.analytics.read": "View account analytics and metrics.",
  "account.billing.read": "View the account's billing information.",
  "account.billing.update": "Update the account's billing information.",
  "account.plan.read": "View the account's current plan.",
  "account.plan.update": "Change the account's plan.",
  "account.read": "View the account and its public keys.",
  "account.subscription.read": "View the account's subscription status.",
  "account.subscription.update": "Manage the account's subscription.",
  "account.update": "Update account settings and information.",
  "admin.create": "Create new admin users.",
  "admin.delete": "Delete admin users.",
  "admin.invite": "Invite new admins to the account.",
  "admin.read": "View the account's admin users.",
  "admin.update": "Update admin users.",
  "arch.read": "View the architectures of the account's releases.",
  "artifact.create": "Upload new release artifacts.",
  "artifact.delete": "Delete release artifacts.",
  "artifact.read": "View and download release artifacts.",
  "artifact.update": "Update release artifacts.",
  "component.create": "Register new machine components.",
  "component.delete": "Remove machine components.",
  "component.read": "View machine components.",
  "component.update": "Update machine components.",
  "channel.read": "View the release channels of the account's releases.",
  "constraint.read": "View a release's entitlement constraints.",
  "engine.read": "View the distribution engines enabled for the account.",
  "entitlement.create": "Create new entitlements.",
  "entitlement.delete": "Delete entitlements.",
  "entitlement.read": "View entitlements.",
  "entitlement.update": "Update entitlements.",
  "environment.create": "Create new environments.",
  "environment.delete": "Delete environments.",
  "environment.read": "View environments.",
  "environment.tokens.generate": "Generate tokens for an environment.",
  "environment.update": "Update environments.",
  "event-log.read": "View the account's event logs.",
  "group.create": "Create new groups.",
  "group.delete": "Delete groups.",
  "group.licenses.read": "View the licenses in a group.",
  "group.machines.read": "View the machines in a group.",
  "group.owners.attach": "Add owners to a group.",
  "group.owners.detach": "Remove owners from a group.",
  "group.owners.read": "View a group's owners.",
  "group.read": "View groups.",
  "group.update": "Update groups.",
  "group.users.read": "View the users in a group.",
  "key.create": "Create new keys in a policy's pool.",
  "key.delete": "Delete keys from a policy's pool.",
  "key.read": "View the keys in a policy's pool.",
  "key.update": "Update keys in a policy's pool.",
  "license.check-in": "Check in licenses that require periodic check-in.",
  "license.check-out": "Check out licenses as portable license files.",
  "license.create": "Create new licenses.",
  "license.delete": "Delete licenses.",
  "license.entitlements.attach": "Attach entitlements to a license.",
  "license.entitlements.detach": "Detach entitlements from a license.",
  "license.group.update": "Change the group a license belongs to.",
  "license.owner.update": "Change a license's owner.",
  "license.policy.update": "Change a license's policy, i.e. transfer it.",
  "license.read": "View licenses.",
  "license.reinstate": "Reinstate suspended licenses.",
  "license.renew": "Renew licenses.",
  "license.revoke": "Revoke licenses, permanently deleting them.",
  "license.suspend": "Suspend licenses, causing validation to fail.",
  "license.tokens.generate": "Generate activation tokens for a license.",
  "license.update": "Update licenses.",
  "license.usage.decrement": "Decrement a license's usage count.",
  "license.usage.increment": "Increment a license's usage count.",
  "license.usage.reset": "Reset a license's usage count.",
  "license.user.update": "Change a license's user, the legacy owner relation.",
  "license.users.attach": "Attach users to a license.",
  "license.users.detach": "Detach users from a license.",
  "license.validate": "Validate licenses.",
  "machine.check-out": "Check out machines as portable machine files.",
  "machine.create": "Activate new machines for a license.",
  "machine.delete": "Deactivate machines.",
  "machine.group.update": "Change the group a machine belongs to.",
  "machine.heartbeat.ping": "Ping a machine's heartbeat to keep it alive.",
  "machine.heartbeat.reset": "Reset a machine's heartbeat.",
  "machine.owner.update": "Change a machine's owner.",
  "machine.proofs.generate": "Generate cryptographic proofs for a machine.",
  "machine.read": "View machines.",
  "machine.update": "Update machines.",
  "package.create": "Create new packages.",
  "package.delete": "Delete packages.",
  "package.read": "View packages.",
  "package.update": "Update packages.",
  "platform.read": "View the platforms of the account's releases.",
  "policy.create": "Create new policies.",
  "policy.delete": "Delete policies.",
  "policy.entitlements.attach": "Attach entitlements to a policy.",
  "policy.entitlements.detach": "Detach entitlements from a policy.",
  "policy.pool.pop": "Pop keys off a policy's finite key pool.",
  "policy.read": "View policies.",
  "policy.update": "Update policies.",
  "process.create": "Spawn new machine processes.",
  "process.delete": "Kill machine processes.",
  "process.heartbeat.ping": "Ping a process's heartbeat to keep it alive.",
  "process.read": "View machine processes.",
  "process.update": "Update machine processes.",
  "product.create": "Create new products.",
  "product.delete": "Delete products.",
  "product.read": "View products.",
  "product.tokens.generate": "Generate tokens for a product.",
  "product.update": "Update products.",
  "release.constraints.attach": "Attach entitlement constraints to a release.",
  "release.constraints.detach":
    "Detach entitlement constraints from a release.",
  "release.create": "Create new releases.",
  "release.delete": "Delete releases.",
  "release.download": "Download release artifacts.",
  "release.package.update": "Change the package a release belongs to.",
  "release.publish": "Publish draft releases.",
  "release.read": "View releases.",
  "release.update": "Update releases.",
  "release.upgrade": "Check for and download release upgrades.",
  "release.upload": "Upload artifacts to a release.",
  "release.yank": "Yank published releases.",
  "request-log.read": "View the account's API request logs.",
  "token.generate": "Generate new tokens.",
  "token.read": "View tokens.",
  "token.regenerate": "Regenerate existing tokens.",
  "token.revoke": "Revoke tokens.",
  "user.ban": "Ban users.",
  "user.create": "Create new users.",
  "user.delete": "Delete users.",
  "user.group.update": "Change the group a user belongs to.",
  "user.invite": "Invite new users to the account.",
  "user.password.reset": "Send password reset emails for users.",
  "user.password.update": "Update a user's password.",
  "user.read": "View users.",
  "user.second-factors.create": "Add second factors, i.e. 2FA, for a user.",
  "user.second-factors.delete": "Remove a user's second factors.",
  "user.second-factors.read": "View a user's second factors.",
  "user.second-factors.update": "Update a user's second factors.",
  "user.tokens.generate": "Generate tokens for a user.",
  "user.unban": "Unban users.",
  "user.update": "Update users.",
  "webhook-endpoint.create": "Create new webhook endpoints.",
  "webhook-endpoint.delete": "Delete webhook endpoints.",
  "webhook-endpoint.read": "View webhook endpoints.",
  "webhook-endpoint.update": "Update webhook endpoints.",
  "webhook-event.delete": "Delete webhook events.",
  "webhook-event.read": "View webhook events and their delivery status.",
  "webhook-event.retry": "Retry webhook event deliveries.",
}
