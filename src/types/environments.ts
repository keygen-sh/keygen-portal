import {
  APIResponse,
  Resource,
  Relationship,
  Linkage,
  Writable,
} from "@/types/api"

export enum EnvironmentErrorCode {
  CODE_TAKEN = "CODE_TAKEN",
}

export enum EnvironmentMode {
  VIEW = "view",
  EDIT = "edit",
  CREATE = "create",
}

export enum EnvironmentView {
  LIST = "list",
  DETAILS = "details",
}

export enum IsolationStrategy {
  ISOLATED = "ISOLATED",
  SHARED = "SHARED",
}

export enum EnvironmentDescription {
  ISOLATED = "Creating a new Isolated environment",
  SHARED = "Creating a new Shared environment",
}

export interface EnvironmentAttributes {
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
