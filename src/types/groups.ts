import { APIResponse, Resource, Relationship, Linkage } from "@/types/api"
import { Writable } from "@/types/utility"

export enum GroupMode {
  View = "view",
  Edit = "edit",
  Create = "create",
}

export enum GroupView {
  List = "list",
  Details = "details",
}

export type GroupAttributes = {
  name: string
  maxUsers: number | null
  maxLicenses: number | null
  maxMachines: number | null
  metadata: Record<string, unknown>
  created: string
  updated: string
}

export interface GroupInput {
  name?: string
  maxUsers?: number | null
  maxLicenses?: number | null
  maxMachines?: number | null
  metadata?: Record<string, unknown>
}

export type GroupRelationships = {
  account: Relationship<Linkage<"accounts">>
  environment: Relationship<Linkage<"environments"> | null>
  owners: Relationship<Linkage<"users">[]>
  users: Relationship<Linkage<"users">[]>
  licenses: Relationship<Linkage<"licenses">[]>
  machines: Relationship<Linkage<"machines">[]>
}

export type Group = Resource<"groups", GroupAttributes, GroupRelationships>

export type GroupResponse = APIResponse<Group>
export type GroupListResponse = APIResponse<Group[]>

export type GroupOwnerAttributes = {
  created: string
  updated: string
}

export type GroupOwnerRelationships = {
  account: Relationship<Linkage<"accounts">>
  environment: Relationship<Linkage<"environments"> | null>
  group: Relationship<Linkage<"groups">>
  user: Relationship<Linkage<"users">>
}

export type GroupOwner = Resource<
  "group-owners",
  GroupOwnerAttributes,
  GroupOwnerRelationships
>

export type GroupOwnerListResponse = APIResponse<GroupOwner[]>

export const GroupAttributeDescriptions: Readonly<
  Record<keyof Writable<GroupAttributes>, string>
> = {
  name: "The name of the group.",
  maxUsers: "The maximum number of users that can be in the group.",
  maxLicenses: "The maximum number of licenses that can be in the group.",
  maxMachines: "The maximum number of machines that can be in the group.",
  metadata:
    "Store arbitrary key/value data on the group for book keeping purposes, supplemental group data, etc.",
} as const

export const GroupFormFieldDescriptions: Readonly<
  typeof GroupAttributeDescriptions
> = {
  ...GroupAttributeDescriptions,
  maxUsers:
    "The maximum number of users that can be in the group. Leave empty for unlimited.",
  maxLicenses:
    "The maximum number of licenses that can be in the group. Leave empty for unlimited.",
  maxMachines:
    "The maximum number of machines that can be in the group. Leave empty for unlimited.",
}

export const GroupCreateFormFieldDescriptions: typeof GroupFormFieldDescriptions =
  {
    ...GroupFormFieldDescriptions,
  }

export const GroupEditFormFieldDescriptions: typeof GroupFormFieldDescriptions =
  {
    ...GroupFormFieldDescriptions,
  }
