import { APIResponse, Resource, Relationship, Linkage } from "@/types/api"
import { Writable } from "@/types/utility"

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

export const AdminPermissions = [
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

export const PortalRequiredPermissions = [
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
] as const

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
