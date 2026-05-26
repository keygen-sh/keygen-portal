import { APIResponse, Resource, Relationship, Linkage } from "@/types/api"
import { Writable } from "@/types/utility"

export enum LicenseErrorCode {
  KeyTaken = "KEY_TAKEN",
  KeyInvalid = "KEY_INVALID",
}

export enum LicenseMode {
  View = "view",
  Edit = "edit",
  Create = "create",
}

export enum LicenseView {
  List = "list",
  Details = "details",
}

export enum LicenseStatus {
  Active = "ACTIVE",
  Inactive = "INACTIVE",
  Expiring = "EXPIRING",
  Expired = "EXPIRED",
  Suspended = "SUSPENDED",
  Banned = "BANNED",
}

export type LicenseAttributes = {
  name: string | null
  key: string
  expiry: string | null
  status: LicenseStatus
  uses: number
  suspended: boolean
  protected: boolean
  version: string | null
  maxMachines: number | null
  maxProcesses: number | null
  maxUsers: number | null
  maxCores: number | null
  maxMemory: number | null
  maxDisk: number | null
  maxUses: number | null
  requireHeartbeat: boolean
  requireCheckIn: boolean
  lastValidated: string | null
  lastCheckOut: string | null
  lastCheckIn: string | null
  nextCheckIn: string | null
  metadata: Record<string, unknown>
  created: string
  updated: string
}

export interface LicenseInput {
  name?: string | null
  key?: string
  expiry?: string | null
  suspended?: boolean
  protected?: boolean
  maxMachines?: number | null
  maxProcesses?: number | null
  maxUsers?: number | null
  maxCores?: number | null
  maxMemory?: number | null
  maxDisk?: number | null
  maxUses?: number | null
  metadata?: Record<string, unknown>
}

export type LicenseRelationships = {
  account: Relationship<Linkage<"accounts">>
  product: Relationship<Linkage<"products">>
  policy: Relationship<Linkage<"policies">>
  group: Relationship<Linkage<"groups"> | null>
  owner: Relationship<Linkage<"users"> | null>
  users: Relationship<Linkage<"users">[]>
  machines: Relationship<Linkage<"machines">[]>
  entitlements: Relationship<Linkage<"entitlements">[]>
}

export type License = Resource<
  "licenses",
  LicenseAttributes,
  LicenseRelationships
>

export type LicenseResponse = APIResponse<License>
export type LicenseListResponse = APIResponse<License[]>

export const LicenseAttributeDescriptions: Readonly<
  Record<keyof Writable<LicenseAttributes>, string>
> = {
  name: "A distinguishing label for the license.",
  key: "The unique license key.",
  expiry: "The time at which the license will expire (UTC timezone).",
  status:
    "The license's overall status. This does not equal a license's validity.",
  uses: "The number of times the license has been used.",
  suspended:
    "Whether the license is suspended. Suspended licenses always fail validation.",
  protected:
    "A protected license disallows users the ability to activate and manage their license's machines client-side. All machine management must be done server-side by an admin when protected.",
  maxMachines:
    "The license's current machine count, along with the policy's maximum machine limit.",
  maxCores:
    "The license's current machine CPU core count, along with the policy's maximum core limit.",
  maxMemory:
    "The license's current machine memory, in bytes, along with the policy's maximum memory limit.",
  maxDisk:
    "The license's current machine disk, in bytes, along with the policy's maximum disk limit.",
  maxProcesses:
    "The license's current process count, along with the policy's maximum process limit.",
  maxUsers:
    "The license's current user count, along with the policy's maximum user limit.",
  maxUses:
    "The license's current usage count, along with the policy's maximum usage limit.",
  version: "The license's last validated release version.",
  requireHeartbeat: "Whether or not machines require heartbeat pings.",
  requireCheckIn:
    "Whether or not the license requires check-in at a predefined interval to continue to pass validation.",
  lastValidated:
    "The time at which the license was last validated (UTC timezone).",
  lastCheckOut:
    "The time at which the license was last checked out (UTC timezone).",
  lastCheckIn:
    "The time at which the license was last checked-in (UTC timezone).",
  nextCheckIn:
    "The time at which the license must be checked-in by to remain valid (UTC timezone).",
  metadata:
    "Store arbitrary key/value data on the license for book keeping purposes, entitlements, etc.",
} as const

export const LicenseFormFieldDescriptions: Readonly<
  typeof LicenseAttributeDescriptions & { owner: string; policy: string }
> = {
  ...LicenseAttributeDescriptions,
  key: "The unique license key. Key will be auto-generated if left blank.",
  expiry:
    "The time at which the license will expire (UTC timezone). When left blank, the expiration is calculated using the policy's duration.",
  maxMachines: "Override the policy's max machines limit for this license.",
  maxProcesses: "Override the policy's max processes limit for this license.",
  maxUsers: "Override the policy's max users limit for this license.",
  maxCores: "Override the policy's max cores limit for this license.",
  maxMemory: "Override the policy's max memory limit for this license.",
  maxDisk: "Override the policy's max disk limit for this license.",
  maxUses: "Override the policy's max uses limit for this license.",
  owner: "The user that owns the license.",
  policy: "The policy to implement for this license.",
}

export const LicenseCreateFormFieldDescriptions: typeof LicenseFormFieldDescriptions =
  {
    ...LicenseFormFieldDescriptions,
  }

export const LicenseEditFormFieldDescriptions: typeof LicenseFormFieldDescriptions =
  {
    ...LicenseFormFieldDescriptions,
  }

export const LicenseDisabledFormFieldDescriptions: Readonly<
  Partial<Record<keyof LicenseAttributes, string>>
> = {
  maxMachines:
    "Max machines cannot be overridden for licenses with a non-floating policy. Value must be 1.",
}

export const LicenseStatusDescriptions: Readonly<
  Record<LicenseStatus, string>
> = {
  [LicenseStatus.Active]:
    "License has been created, validated, checked out, or checked in within the last 90 days.",
  [LicenseStatus.Inactive]: "License has had no activity in the past 90 days.",
  [LicenseStatus.Expiring]: "License is expiring within the next 3 days.",
  [LicenseStatus.Expired]: "License expiration date has passed.",
  [LicenseStatus.Suspended]:
    "License has been suspended and will always fail validation.",
  [LicenseStatus.Banned]:
    "License is associated with a user who has been banned.",
} as const

export const LicenseStatusLabels: Readonly<Record<LicenseStatus, string>> = {
  [LicenseStatus.Active]: "Active",
  [LicenseStatus.Inactive]: "Inactive",
  [LicenseStatus.Expiring]: "Expiring",
  [LicenseStatus.Expired]: "Expired",
  [LicenseStatus.Suspended]: "Suspended",
  [LicenseStatus.Banned]: "Banned",
} as const

export const LicenseStatusVariants: Readonly<
  Record<
    LicenseStatus,
    "default" | "secondary" | "destructive" | "outline" | "disabled"
  >
> = {
  [LicenseStatus.Active]: "secondary",
  [LicenseStatus.Inactive]: "secondary",
  [LicenseStatus.Expiring]: "secondary",
  [LicenseStatus.Expired]: "disabled",
  [LicenseStatus.Suspended]: "destructive",
  [LicenseStatus.Banned]: "destructive",
} as const

export type LicenseFileAttributes = {
  certificate: string
  algorithm: string
  include: string[]
  ttl: number | null
  expiry: string | null
  issued: string
}

export type LicenseFileRelationships = {
  account: Relationship<Linkage<"accounts">>
  license: Relationship<Linkage<"licenses">>
}

export type LicenseFile = Resource<
  "license-files",
  LicenseFileAttributes,
  LicenseFileRelationships
>

export type LicenseFileResponse = APIResponse<LicenseFile>

export type LicenseFilters = {
  status?: string
  expires?: Record<string, string>
  expired?: Record<string, string>
  activity?: Record<string, string>
  unassigned?: boolean
  assigned?: boolean
  activated?: boolean
  activations?: Record<string, number>
  product?: string
  policy?: string
  owner?: string
  user?: string
  group?: string
  machine?: string
  metadata?: Record<string, string>
}

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
