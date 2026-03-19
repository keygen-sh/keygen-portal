import { APIResponse, Resource, Relationship, Linkage } from "@/types/api"

export enum ReleaseMode {
  View = "view",
  Edit = "edit",
  Create = "create",
}

export enum ReleaseView {
  List = "list",
  Details = "details",
}

export enum ReleaseStatus {
  Draft = "DRAFT",
  Published = "PUBLISHED",
  Yanked = "YANKED",
}

export enum ReleaseChannel {
  Stable = "stable",
  Rc = "rc",
  Beta = "beta",
  Alpha = "alpha",
  Dev = "dev",
}

export type ReleaseAttributes = {
  name: string | null
  version: string
  tag: string | null
  channel: ReleaseChannel
  status: ReleaseStatus
  description: string | null
  metadata: Record<string, unknown>
  backdated: string | null
  created: string
  updated: string
}

export type ReleaseRelationships = {
  account: Relationship<Linkage<"accounts">>
  product: Relationship<Linkage<"products">>
  constraints: Relationship<Linkage<"constraints">[]>
}

export type Release = Resource<
  "releases",
  ReleaseAttributes,
  ReleaseRelationships
>

export type ReleaseResponse = APIResponse<Release>
export type ReleasesListResponse = APIResponse<Release[]>
