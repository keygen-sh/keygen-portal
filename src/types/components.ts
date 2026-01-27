import { APIResponse, Resource, Relationship, Linkage } from "@/types/api"

export enum ComponentMode {
  View = "view",
  Edit = "edit",
  Create = "create",
}

export enum ComponentView {
  List = "list",
  Details = "details",
}

export type ComponentAttributes = {
  fingerprint: string
  name: string | null
  metadata: Record<string, unknown>
  created: string
  updated: string
}

export interface ComponentInput {
  fingerprint?: string
  name?: string | null
  metadata?: Record<string, unknown>
}

export type ComponentRelationships = {
  account: Relationship<Linkage<"accounts">>
  environment: Relationship<Linkage<"environments"> | null>
  product: Relationship<Linkage<"products">>
  license: Relationship<Linkage<"licenses">>
  machine: Relationship<Linkage<"machines">>
}

export type Component = Resource<
  "components",
  ComponentAttributes,
  ComponentRelationships
>

export type ComponentResponse = APIResponse<Component>
export type ComponentListResponse = APIResponse<Component[]>

export const ComponentAttributeDescriptions: Readonly<
  Record<keyof Omit<ComponentAttributes, "created" | "updated">, string>
> = {
  fingerprint: "The unique fingerprint of the component.",
  name: "The human-readable name of the component.",
  metadata:
    "Store arbitrary key/value data on the component for book keeping purposes, entitlements, etc.",
} as const

export const ComponentFormFieldDescriptions: Readonly<
  Record<
    keyof Omit<ComponentAttributes, "created" | "updated"> | "machine",
    string
  >
> = {
  ...ComponentAttributeDescriptions,
  fingerprint:
    "The unique fingerprint of the component, e.g. a motherboard serial number. This can be an arbitrary string, but must be unique within the scope of the machine it belongs to or according to the policy's component uniqueness strategy.",
  machine: "The machine that the component is for.",
}
