export enum ErrorCode {
  PASSWORD_REQUIRED = "PASSWORD_REQUIRED",
  PASSWORD_INVALID = "PASSWORD_INVALID",
  EMAIL_INVALID = "EMAIL_INVALID",
  OTP_REQUIRED = "OTP_REQUIRED",
  OTP_INVALID = "OTP_INVALID",
}

export const error = {
  codes: {
    auth: new Set<ErrorCode>([
      ErrorCode.PASSWORD_REQUIRED,
      ErrorCode.PASSWORD_INVALID,
      ErrorCode.EMAIL_INVALID,
      ErrorCode.OTP_REQUIRED,
      ErrorCode.OTP_INVALID,
    ]),
  },
}

/**
 * Checks if provided error code is an authentication error.
 *
 * @param code - Error code to check
 * @returns true if error code is an authentication error as defined above in error.codes.auth, otherwise false
 */
export function isAuthError(code: string) {
  return error.codes.auth.has(code as ErrorCode)
}
