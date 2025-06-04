import { AUTH_ERROR_CODES } from "@/types/auth"

export const error = {
  codes: {
    auth: new Set<AUTH_ERROR_CODES>([
      AUTH_ERROR_CODES.PASSWORD_REQUIRED,
      AUTH_ERROR_CODES.PASSWORD_INVALID,
      AUTH_ERROR_CODES.EMAIL_INVALID,
      AUTH_ERROR_CODES.OTP_REQUIRED,
      AUTH_ERROR_CODES.OTP_INVALID,
    ]),
  },
}

/**
 * Checks if provided error code is an authentication error.
 */
export function isAuthError(code: string): boolean {
  return error.codes.auth.has(code as AUTH_ERROR_CODES)
}
