import { AuthErrorCodes } from "@/types/auth"

export const error = {
  codes: {
    auth: new Set<AuthErrorCodes>([
      AuthErrorCodes.PASSWORD_REQUIRED,
      AuthErrorCodes.PASSWORD_INVALID,
      AuthErrorCodes.EMAIL_INVALID,
      AuthErrorCodes.OTP_REQUIRED,
      AuthErrorCodes.OTP_INVALID,
    ]),
  },
}

/**
 * Checks if provided error code is an authentication error.
 */
export function isAuthError(code: string): boolean {
  return error.codes.auth.has(code as AuthErrorCodes)
}
