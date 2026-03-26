import { APIResponse, Resource, Relationship, Linkage } from "@/types/api"

export type ArchAttributes = {
  name: string
  key: string
  created: string
  updated: string
}

export type ArchRelationships = {
  account: Relationship<Linkage<"accounts">>
}

export type Arch = Resource<"arches", ArchAttributes, ArchRelationships>

export type ArchResponse = APIResponse<Arch>
export type ArchesListResponse = APIResponse<Arch[]>
