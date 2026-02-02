import { APIResponse, Resource, Relationship, Linkage } from "@/types/api"

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
  permissions: string[]
  metadata: Record<string, unknown>
  created: string
  updated: string
}

export interface UserInput {
  email?: string
  firstName?: string | null
  lastName?: string | null
  role?: UserRole
  permissions?: string[]
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
}

export type User = Resource<"users", UserAttributes, UserRelationships>

export type UserResponse = APIResponse<User>
export type UserListResponse = APIResponse<User[]>

export const UserAttributeDescriptions: Readonly<
  Record<keyof Omit<UserAttributes, "created" | "updated">, string>
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
