import { authenticate, AuthResponse } from "./authenticate"
import config from "./config"
import { verify } from "./verify"
import { ErrorCode, error, isAuthError } from "./errors"

export { authenticate, config, verify, error, isAuthError, ErrorCode }
export type { AuthResponse }
