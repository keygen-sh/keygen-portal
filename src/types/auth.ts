import { APIResponse } from "@/types/api"
import type { FieldNames } from "@/schemas/auth"

export enum AuthErrorCode {
  PasswordRequired = "PASSWORD_REQUIRED",
  PasswordInvalid = "PASSWORD_INVALID",
  EmailInvalid = "EMAIL_INVALID",
  OtpRequired = "OTP_REQUIRED",
  OtpInvalid = "OTP_INVALID",
  SsoRequired = "SSO_REQUIRED",
  SsoNotSupported = "SSO_NOT_SUPPORTED",
  SsoAccountNotFound = "SSO_ACCOUNT_NOT_FOUND",
  SsoUserNotAllowed = "SSO_USER_NOT_ALLOWED",
  SsoStateMissing = "SSO_STATE_MISSING",
  SsoStateInvalid = "SSO_STATE_INVALID",
  SsoEnvironmentNotFound = "SSO_ENVIRONMENT_NOT_FOUND",
  SsoUserNotFound = "SSO_USER_NOT_FOUND",
  SsoUserInvalid = "SSO_USER_INVALID",
  SsoSessionInvalid = "SSO_SESSION_INVALID",
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

export const AuthFormFieldDescriptions: Readonly<Record<FieldNames, string>> = {
  email: "The email address associated with your account.",
  password: "The password for your account.",
  newPassword: "Choose a new password. Must be at least 8 characters.",
  slug: 'This can either be your Keygen account\'s "slug" or its unique ID.',
  remember: "Keep your session active on this device.",
  otp: "The 6-digit code from your two-factor authentication app.",
} as const
