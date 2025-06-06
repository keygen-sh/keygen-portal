import { AuthErrorCode } from "@/types/auth"

export const error = {
  codes: {
    auth: new Set<AuthErrorCode>([
      AuthErrorCode.PASSWORD_REQUIRED,
      AuthErrorCode.PASSWORD_INVALID,
      AuthErrorCode.EMAIL_INVALID,
      AuthErrorCode.OTP_REQUIRED,
      AuthErrorCode.OTP_INVALID,
    ]),
  },
}

/**
 * Checks if provided error code is an authentication error.
 */
export function isAuthError(code: string): boolean {
  return error.codes.auth.has(code as AuthErrorCode)
}
