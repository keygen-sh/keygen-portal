import { APIResponse, Resource, Relationship, Linkage } from "@/types/api"

export type EngineAttributes = {
  key: string
  created: string
  updated: string
}

export type EngineRelationships = {
  account: Relationship<Linkage<"accounts">>
}

export type Engine = Resource<"engines", EngineAttributes, EngineRelationships>

export type EngineResponse = APIResponse<Engine>
export type EnginesListResponse = APIResponse<Engine[]>
