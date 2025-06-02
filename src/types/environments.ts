import { APIResponse } from "@/types/api"
import { STRATEGIES } from "@/constants/environments"

export interface EnvironmentAttributes {
  name: string
  code: string
  isolationStrategy: STRATEGIES
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
