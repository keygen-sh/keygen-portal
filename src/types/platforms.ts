import { APIResponse, Resource, Relationship, Linkage } from "@/types/api"

export type PlatformAttributes = {
  name: string
  key: string
  created: string
  updated: string
}

export type PlatformRelationships = {
  account: Relationship<Linkage<"accounts">>
}

export type Platform = Resource<
  "platforms",
  PlatformAttributes,
  PlatformRelationships
>

export type PlatformResponse = APIResponse<Platform>
export type PlatformsListResponse = APIResponse<Platform[]>
