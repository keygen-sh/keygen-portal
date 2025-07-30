import { APIResponse } from "@/types/api"
import { Relationships } from "@/types/relationships"

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

export interface Environment {
  id: string
  type: "environments"
  attributes: EnvironmentAttributes
  relationships: Relationships
  links: {
    self: string
  }
}

export type EnvironmentResponse = APIResponse<Environment>

export type EnvironmentsListResponse = APIResponse<Environment[]>
