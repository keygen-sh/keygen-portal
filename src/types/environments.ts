import {
  APIResponse,
  Resource,
  Relationship,
  Linkage,
  Writable,
} from "@/types/api"

export enum EnvironmentErrorCode {
  CodeTaken = "CODE_TAKEN",
}

export enum EnvironmentMode {
  View = "view",
  Edit = "edit",
  Create = "create",
}

export enum EnvironmentView {
  List = "list",
  Details = "details",
}

export enum IsolationStrategy {
  Isolated = "ISOLATED",
  Shared = "SHARED",
}

export type EnvironmentAttributes = {
  name: string
  code: string
  isolationStrategy: IsolationStrategy
  created: string
  updated: string
}

export type EnvironmentRelationships = {
  account: Relationship<Linkage<"accounts">>
}

export type Environment = Resource<
  "environments",
  EnvironmentAttributes,
  EnvironmentRelationships
>

export type EnvironmentResponse = APIResponse<Environment>
export type EnvironmentsListResponse = APIResponse<Environment[]>

export type CreateEnvironmentPayload = Writable<EnvironmentAttributes>
export type UpdateEnvironmentPayload = Partial<Writable<EnvironmentAttributes>>

