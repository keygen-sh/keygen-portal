import { APIResponse } from "@/types/api"

export enum EnvironmentModes {
  VIEW = "view",
  EDIT = "edit",
  CREATE = "create",
}

export enum EnvironmentViews {
  LIST = "list",
  DETAILS = "details",
}

export enum IsolationStrategies {
  ISOLATED = "ISOLATED",
  SHARED = "SHARED",
}

export enum EnvironmentDescriptions {
  ISOLATED = "Creating a new Isolated environment",
  SHARED = "Creating a new Shared environment",
}

export interface EnvironmentAttributes {
  name: string
  code: string
  isolationStrategy: IsolationStrategies
  created: string
  updated: string
}

export interface EnvironmentRelationships {
  account: {
    links: {
      related: string
    }
    data: {
      id: string
      type: "accounts"
    }
  }
}

export interface Environment {
  id: string
  type: "environments"
  attributes: EnvironmentAttributes
  relationships: EnvironmentRelationships
  links: {
    self: string
  }
}

export type EnvironmentResponse = APIResponse<Environment>

export type EnvironmentsListResponse = APIResponse<Environment[]>
