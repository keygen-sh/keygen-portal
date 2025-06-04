import { APIResponse } from "@/types/api"

export enum AUTH_ERROR_CODES {
  PASSWORD_REQUIRED = "PASSWORD_REQUIRED",
  PASSWORD_INVALID = "PASSWORD_INVALID",
  EMAIL_INVALID = "EMAIL_INVALID",
  OTP_REQUIRED = "OTP_REQUIRED",
  OTP_INVALID = "OTP_INVALID",
}

export interface AuthAttributes {
  token: string
  kind: string
  name: string | null
  permissions: string[]
  expiry: string | null
  created: string
  updated: string
}

export interface AuthRelationships {
  account: {
    links: {
      related: string
    }
    data: {
      id: string
      type: "accounts"
    }
  }
  bearer: {
    links: {
      related: string
    }
    data: {
      id: string
      type: "users"
    }
  }
  environment: {
    links: {
      related: string | null
    }
    data: {
      id: string
      type: "environments"
    } | null
  }
}

export interface Auth {
  id: string
  type: "tokens"
  attributes: AuthAttributes
  relationships: AuthRelationships
  links: {
    self: string
  }
}

export type AuthResponse = APIResponse<Auth>
